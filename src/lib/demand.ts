/**
 * 소비자 관심도(노출·하트) 데이터 접근 함수. supabase/demand.sql의 RPC를 호출합니다.
 * likes.ts와 같이 실패해도 예외를 던지지 않아, 호출하는 화면은 관심도 없이 그대로 동작합니다.
 */
import { callRpc, isSupabaseConfigured } from './supabaseRest';
import { getDeviceId } from './deviceId';
import type { DemandStat } from './demandScoring';

/** 하트를 누를 수 있는 화면(소비자 결과 TOP 1)에 품종이 보여졌음을 기록합니다. 기기·품종별 1회만 저장됩니다. */
export async function recordImpression(varietyId: string): Promise<void> {
  if (!isSupabaseConfigured || !varietyId) return;
  try {
    await callRpc<null>('record_impression', { p_device_id: getDeviceId(), p_variety_id: varietyId });
  } catch {
    // 노출 기록 실패는 화면 동작에 영향을 주지 않도록 조용히 넘깁니다.
  }
}

/** 품종별 하트 수·노출 기기 수. 실패하거나 Supabase가 없으면 null */
export async function getDemandStats(varietyIds: string[]): Promise<Record<string, DemandStat> | null> {
  if (!isSupabaseConfigured || varietyIds.length === 0) return null;
  try {
    const rows = await callRpc<{ variety_id: string; like_count: number; impression_count: number }[]>(
      'get_demand_stats',
      { p_variety_ids: varietyIds },
    );
    const stats: Record<string, DemandStat> = {};
    rows.forEach((row) => {
      stats[row.variety_id] = { likes: Number(row.like_count), views: Number(row.impression_count) };
    });
    return stats;
  } catch {
    return null;
  }
}
