/**
 * 소비자 "좋아요" 데이터 접근 함수.
 * 모두 실패 시 예외를 던지지 않고 { ok:false }를 반환해서, 호출하는 화면이
 * (추천 결과는 그대로 두고) 해당 영역에만 재시도 안내를 보여줄 수 있게 합니다.
 */
import { callRpc, isSupabaseConfigured } from './supabaseRest';
import { getDeviceId } from './deviceId';

export type LikeResult<T> = { ok: true; value: T } | { ok: false };

/** 품종별 좋아요 수. 요청한 variety_id는 좋아요가 0개여도 항상 포함됩니다. */
export async function getLikeCounts(
  varietyIds: string[],
  range?: { since?: string; until?: string },
): Promise<LikeResult<Record<string, number>>> {
  if (varietyIds.length === 0) return { ok: true, value: {} };
  try {
    const rows = await callRpc<{ variety_id: string; like_count: number }[]>('get_like_counts', {
      p_variety_ids: varietyIds,
      p_since: range?.since ?? null,
      p_until: range?.until ?? null,
    });
    const value: Record<string, number> = {};
    rows.forEach((row) => {
      value[row.variety_id] = Number(row.like_count);
    });
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

/** 이 기기가 이미 좋아요한 품종ID 집합 (서버 기준 진위 확인용) */
export async function getMyLikes(varietyIds: string[]): Promise<LikeResult<Set<string>>> {
  if (varietyIds.length === 0) return { ok: true, value: new Set() };
  try {
    const rows = await callRpc<{ variety_id: string }[]>('get_my_likes', {
      p_device_id: getDeviceId(),
      p_variety_ids: varietyIds,
    });
    return { ok: true, value: new Set(rows.map((r) => r.variety_id)) };
  } catch {
    return { ok: false };
  }
}

/** 좋아요 토글. 반환되는 like_count는 항상 서버에서 다시 센 실제 값입니다. */
export async function toggleLike(varietyId: string): Promise<LikeResult<{ liked: boolean; likeCount: number }>> {
  try {
    const rows = await callRpc<{ liked: boolean; like_count: number }[]>('toggle_like', {
      p_device_id: getDeviceId(),
      p_variety_id: varietyId,
    });
    const row = rows[0];
    if (!row) return { ok: false };
    return { ok: true, value: { liked: row.liked, likeCount: Number(row.like_count) } };
  } catch {
    return { ok: false };
  }
}

export { isSupabaseConfigured };
