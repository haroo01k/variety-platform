-- 기후농사 소비자 "좋아요" 기능용 스키마
-- Supabase 대시보드 → SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
--
-- 설계 원칙
--  1) 프런트엔드는 anon key만 사용합니다. service_role 키는 절대 노출하지 않습니다.
--  2) variety_likes 테이블은 anon/authenticated 역할의 직접 접근을 모두 차단합니다
--     (RLS 활성화 + 권한 REVOKE 이중 방어). 모든 조회/기록은 아래 SECURITY DEFINER
--     함수(get_like_counts, get_my_likes, toggle_like)를 통해서만 이루어집니다.
--  3) anonymous_device_id는 브라우저 localStorage에 생성한 무작위 문자열일 뿐,
--     로그인 계정이나 개인정보와 연결되지 않습니다.

-- 1. 테이블 -------------------------------------------------------------
create table if not exists public.variety_likes (
  id uuid primary key default gen_random_uuid(),
  variety_id text not null,
  anonymous_device_id text not null,
  created_at timestamptz not null default now(),
  constraint variety_likes_unique_device_variety unique (variety_id, anonymous_device_id)
);

create index if not exists variety_likes_variety_id_idx on public.variety_likes (variety_id);
create index if not exists variety_likes_created_at_idx on public.variety_likes (created_at);

-- 2. RLS: 정책을 하나도 만들지 않아 기본값(전면 차단)으로 둡니다.
--    아래 REVOKE와 함께, 오직 SECURITY DEFINER 함수만 이 테이블을 다룰 수 있습니다.
alter table public.variety_likes enable row level security;

revoke all on table public.variety_likes from anon, authenticated;
-- service_role은 Supabase가 기본적으로 RLS를 우회하므로 별도 권한 부여가 필요 없습니다.

-- 3. 품종별 좋아요 수 조회 (공개, 집계값만 반환) --------------------------
-- p_variety_ids: 조회할 품종ID 배열 (요청한 id는 좋아요가 0개여도 항상 포함되어 반환됩니다)
-- p_since / p_until: 관리자 화면의 날짜 범위 조회용 (생략하면 전체 기간)
create or replace function public.get_like_counts(
  p_variety_ids text[],
  p_since timestamptz default null,
  p_until timestamptz default null
)
returns table (variety_id text, like_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select v.variety_id, coalesce(count(l.id), 0) as like_count
  from unnest(p_variety_ids) as v(variety_id)
  left join public.variety_likes l
    on l.variety_id = v.variety_id
    and (p_since is null or l.created_at >= p_since)
    and (p_until is null or l.created_at <= p_until)
  group by v.variety_id;
$$;

-- 4. 이 기기가 이미 좋아요한 품종 목록 (새로고침/재방문 시 하트 상태 복원용) --
create or replace function public.get_my_likes(
  p_device_id text,
  p_variety_ids text[]
)
returns table (variety_id text)
language sql
stable
security definer
set search_path = public
as $$
  select variety_id
  from public.variety_likes
  where anonymous_device_id = p_device_id
    and variety_id = any(p_variety_ids);
$$;

-- 5. 좋아요 토글 (있으면 취소, 없으면 등록) -------------------------------
-- 반환값은 항상 "다시 조회한 실제 집계값"입니다. 프런트엔드에서 숫자를 임의로
-- 더하거나 빼지 않고 이 값을 그대로 표시해야 합니다.
-- unique 제약 + DELETE→INSERT 순서로 동시 요청에도 중복 저장되지 않습니다.
create or replace function public.toggle_like(
  p_device_id text,
  p_variety_id text
)
returns table (liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted boolean;
begin
  if p_device_id is null or length(trim(p_device_id)) = 0 then
    raise exception 'device id is required';
  end if;

  delete from public.variety_likes
  where anonymous_device_id = p_device_id and variety_id = p_variety_id
  returning true into v_deleted;

  if v_deleted is null then
    insert into public.variety_likes (variety_id, anonymous_device_id)
    values (p_variety_id, p_device_id)
    on conflict (variety_id, anonymous_device_id) do nothing;
  end if;

  return query
    select (v_deleted is null) as liked, count(*) as like_count
    from public.variety_likes
    where variety_id = p_variety_id;
end;
$$;

-- 6. anon 역할에 "함수 실행 권한"만 부여 (테이블 직접 접근 권한은 주지 않음) --
grant execute on function public.get_like_counts(text[], timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.get_my_likes(text, text[]) to anon, authenticated;
grant execute on function public.toggle_like(text, text) to anon, authenticated;
