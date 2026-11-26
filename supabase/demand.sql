-- 기후농사 "소비자 관심도(참고 지표)" 기능용 추가 스키마
-- schema.sql(좋아요)을 먼저 실행한 뒤, Supabase 대시보드 → SQL Editor에 이 파일 전체를 붙여넣고 실행하세요.
-- 여러 번 실행해도 안전합니다(create if not exists / create or replace).
--
-- 목적
--  하트 수만 세면 "많이 보여진 품종"이 유리해집니다. 관심도는 농업인 결과에 참고 지표로만 보여주며 추천 순위에는 반영하지 않습니다. 그래서 하트를 누를 수 있는 화면
--  (소비자 결과 TOP 1)에 품종이 보여진 기기 수(노출)를 함께 기록해, 노출 대비 하트 비율로
--  소비자 관심도를 계산합니다. 계산 자체는 프런트엔드(src/lib/demandScoring.ts)에서 합니다.
--
-- 설계 원칙은 schema.sql과 같습니다.
--  - 테이블 직접 접근은 막고(RLS + REVOKE), SECURITY DEFINER 함수로만 기록·조회합니다.
--  - 노출은 기기·품종별 1회만 기록합니다(같은 기기가 여러 번 봐도 1).

-- 1. 노출 테이블 ------------------------------------------------------------
create table if not exists public.variety_impressions (
  id uuid primary key default gen_random_uuid(),
  variety_id text not null,
  anonymous_device_id text not null,
  created_at timestamptz not null default now(),
  constraint variety_impressions_unique_device_variety unique (variety_id, anonymous_device_id)
);

create index if not exists variety_impressions_variety_id_idx on public.variety_impressions (variety_id);

alter table public.variety_impressions enable row level security;
revoke all on table public.variety_impressions from anon, authenticated;

-- 2. 노출 기록 (기기·품종별 1회) ----------------------------------------------
create or replace function public.record_impression(
  p_device_id text,
  p_variety_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_device_id is null or length(trim(p_device_id)) = 0 then
    raise exception 'device id is required';
  end if;
  if p_variety_id is null or length(trim(p_variety_id)) = 0 then
    raise exception 'variety id is required';
  end if;

  insert into public.variety_impressions (variety_id, anonymous_device_id)
  values (p_variety_id, p_device_id)
  on conflict (variety_id, anonymous_device_id) do nothing;
end;
$$;

-- 3. 품종별 하트 수 + 노출 기기 수 (집계값만 반환) ---------------------------
-- 요청한 variety_id는 기록이 없어도 0으로 항상 포함됩니다.
create or replace function public.get_demand_stats(
  p_variety_ids text[]
)
returns table (variety_id text, like_count bigint, impression_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.variety_id,
    (select count(*) from public.variety_likes l where l.variety_id = v.variety_id) as like_count,
    (select count(*) from public.variety_impressions i where i.variety_id = v.variety_id) as impression_count
  from unnest(p_variety_ids) as v(variety_id);
$$;

-- 4. anon 역할에는 함수 실행 권한만 부여 ---------------------------------------
grant execute on function public.record_impression(text, text) to anon, authenticated;
grant execute on function public.get_demand_stats(text[]) to anon, authenticated;
