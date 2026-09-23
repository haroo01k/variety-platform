import { useEffect, useMemo, useState } from 'react';
import { Container } from '../components/common/Container';
import { CROPS } from '../data/crops';
import { VARIETIES } from '../data/varieties';
import { getLikeCounts } from '../lib/likes';
import type { CropId } from '../types/crop';

type CropFilter = 'all' | CropId;
type LoadState = 'loading' | 'ready' | 'error';

interface Row {
  varietyId: string;
  name: string;
  cropName: string;
  cropId: CropId;
  likeCount: number;
}

/**
 * 관리자용 좋아요 집계 화면 (`/admin`).
 * 작물별·품종별 누적 좋아요 수를 확인하는 조회 전용 화면이며,
 * 데이터를 수정하거나 삭제하는 기능은 없습니다.
 * 로그인/권한 체계는 아직 없는 단계라(PROJECT.md 4단계 예정) 이 화면도 별도 인증 없이 열립니다.
 */
export function AdminLikesPage() {
  const [cropFilter, setCropFilter] = useState<CropFilter>('all');
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [appliedRange, setAppliedRange] = useState<{ since?: string; until?: string }>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  // 요청 키와 "그 결과가 도착했는지"를 비교해서 로딩 여부를 판단합니다
  // (effect 안에서 곧바로 setState('loading')을 호출하지 않기 위한 패턴).
  const requestKey = `${appliedRange.since ?? ''}~${appliedRange.until ?? ''}:${reloadKey}`;
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const range = {
        since: appliedRange.since ? new Date(appliedRange.since).toISOString() : undefined,
        until: appliedRange.until ? new Date(appliedRange.until).toISOString() : undefined,
      };
      const result = await getLikeCounts(
        VARIETIES.map((v) => v.id),
        range,
      );
      if (cancelled) return;

      if (!result.ok) {
        setErrorKey(requestKey);
        return;
      }

      const nextRows: Row[] = VARIETIES.map((v) => ({
        varietyId: v.id,
        name: v.name,
        cropName: v.cropName,
        cropId: v.cropId,
        likeCount: result.value[v.id] ?? 0,
      })).sort((a, b) => b.likeCount - a.likeCount || a.varietyId.localeCompare(b.varietyId));

      setRows(nextRows);
      setResolvedKey(requestKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [appliedRange, requestKey]);

  const state: LoadState = errorKey === requestKey ? 'error' : resolvedKey === requestKey ? 'ready' : 'loading';

  const visibleRows = useMemo(
    () => (cropFilter === 'all' ? rows : rows.filter((r) => r.cropId === cropFilter)),
    [rows, cropFilter],
  );

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">좋아요 집계 (관리자)</h1>
        <p className="mt-2 text-sm text-slate-500">
          작물·품종별 누적 좋아요 수를 확인하는 조회 전용 화면이에요. 여기서는 데이터를 수정·삭제할 수 없어요.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCropFilter('all')}
          className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold ${
            cropFilter === 'all'
              ? 'border-brand-green bg-brand-green-light text-brand-green-dark'
              : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          전체
        </button>
        {CROPS.map((crop) => (
          <button
            key={crop.id}
            type="button"
            onClick={() => setCropFilter(crop.id)}
            className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold ${
              cropFilter === crop.id
                ? 'border-brand-green bg-brand-green-light text-brand-green-dark'
                : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {crop.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <label className="flex flex-col text-xs font-semibold text-slate-500">
          시작일
          <input
            type="date"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="mt-1 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col text-xs font-semibold text-slate-500">
          종료일
          <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="mt-1 min-h-[44px] rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => setAppliedRange({ since: since || undefined, until: until || undefined })}
          className="min-h-[44px] rounded-full bg-brand-green px-4 text-sm font-semibold text-white"
        >
          기간 적용
        </button>
        {(since || until) && (
          <button
            type="button"
            onClick={() => {
              setSince('');
              setUntil('');
              setAppliedRange({});
            }}
            className="min-h-[44px] rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-600"
          >
            초기화
          </button>
        )}
      </div>

      {state === 'loading' && <p className="text-sm text-slate-400">불러오는 중이에요…</p>}

      {state === 'error' && (
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
          <p>좋아요 데이터를 불러오지 못했어요. Supabase 연결 설정을 확인해주세요.</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-2 min-h-[44px] rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-600"
          >
            다시 시도
          </button>
        </div>
      )}

      {state === 'ready' && visibleRows.length === 0 && (
        <p className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">해당 조건의 품종이 없어요.</p>
      )}

      {state === 'ready' && visibleRows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="px-4 py-3 font-semibold">순위</th>
                <th className="px-4 py-3 font-semibold">작물</th>
                <th className="px-4 py-3 font-semibold">품종명</th>
                <th className="px-4 py-3 text-right font-semibold">좋아요 수</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, i) => (
                <tr key={row.varietyId} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 text-slate-600">{row.cropName}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-500">
                    <span aria-hidden="true">♥</span> {row.likeCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
