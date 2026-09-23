/**
 * Supabase에 아주 얇게 붙는 REST(RPC) 호출 도우미.
 * 좋아요 기능은 RPC 함수 3개만 호출하면 되므로, @supabase/supabase-js를 새로 설치하지 않고
 * PostgREST의 RPC 엔드포인트(`/rest/v1/rpc/<함수명>`)를 fetch로 직접 호출합니다.
 * (이미 fetch로 충분히 해결되는 문제라 새 패키지를 추가하지 않았습니다.)
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** .env.local에 Supabase 값이 설정되어 있는지 여부 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export async function callRpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!isSupabaseConfigured || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local을 확인해주세요.');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    throw new Error(`Supabase RPC(${fn}) 요청 실패: ${res.status}`);
  }

  return (await res.json()) as T;
}
