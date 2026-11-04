import { useEffect, useRef, useState } from 'react';
import { getLikeCounts, getMyLikes, isSupabaseConfigured, toggleLike } from '../../lib/likes';
import { getLocalLikedSet, setLocalLiked } from '../../lib/deviceId';

interface LikeButtonProps {
  varietyId: string;
  /** 작은 화면(미니 카드)에서는 'sm', 기본은 'md' */
  size?: 'md' | 'sm';
  /** true면 "좋아요" 글자 없이 하트와 누적 수만 보여줍니다(카드 저장·공유 버튼과 같은 크기의 액션 그룹용). */
  compact?: boolean;
  className?: string;
  /** compact 모드에서 오류 안내를 버튼 밖(카드의 안내 줄)에 보여주기 위한 콜백 */
  onError?: (message: string) => void;
}

const NOT_CONFIGURED_MESSAGE = '먹어보고 싶어요 집계 서버가 아직 연결되지 않았어요.';
const FAILED_MESSAGE = '먹어보고 싶어요를 처리하지 못했어요. 잠시 후 다시 시도해주세요.';

/**
 * 소비자 화면 전용 "먹어보고 싶어요" 하트 버튼. 토글 방식이며,
 * 로그인 없이 기기별 익명 ID(device_id)로 Supabase에 기록합니다.
 * - 누적 수는 서버 집계값만 표시합니다. 불러오기 전·실패 시에는 숫자 대신 "–"를 보여주고, 누를 때도 임의로 더하지 않습니다.
 * - 하트 채움은 누르는 즉시 바꾸고, 서버 요청이 실패하면 직전 상태로 되돌립니다. 처리 중에는 다시 누를 수 없습니다.
 */
export function LikeButton({ varietyId, size = 'md', compact = false, className = '', onError }: LikeButtonProps) {
  const [liked, setLiked] = useState(() => getLocalLikedSet().has(varietyId));
  /** 서버에서 받은 누적 수. null이면 아직 모르거나 불러오지 못함 */
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  /** 화면이 다시 그려지기 전의 연속 클릭까지 막기 위한 즉시 잠금 */
  const pendingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      const [countsResult, likedResult] = await Promise.all([
        getLikeCounts([varietyId]),
        getMyLikes([varietyId]),
      ]);
      if (cancelled) return;

      setCount(countsResult.ok ? (countsResult.value[varietyId] ?? 0) : null);

      if (likedResult.ok) {
        const serverLiked = likedResult.value.has(varietyId);
        setLiked(serverLiked);
        setLocalLiked(varietyId, serverLiked);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [varietyId]);

  const report = (message: string) => {
    setError(message);
    onError?.(message);
  };

  const handleClick = async () => {
    if (pendingRef.current) return;
    if (!isSupabaseConfigured) {
      report(NOT_CONFIGURED_MESSAGE);
      return;
    }
    const prevLiked = liked;

    pendingRef.current = true;
    setPending(true);
    setError(null);
    setLiked(!liked);
    setPop(true);

    const result = await toggleLike(varietyId);
    if (result.ok) {
      setLiked(result.value.liked);
      setCount(result.value.likeCount);
      setLocalLiked(varietyId, result.value.liked);
    } else {
      setLiked(prevLiked);
      report(FAILED_MESSAGE);
    }
    pendingRef.current = false;
    setPending(false);
  };

  const countText = count === null ? '–' : String(count);
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const total = count === null ? '누적 수 확인 중' : `누적 ${count}명`;
  const label = liked ? `먹어보고 싶어요 취소 (${total})` : `먹어보고 싶어요 (${total})`;

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={label}
        onAnimationEnd={() => setPop(false)}
        className={`flex h-11 items-center justify-center gap-1.5 rounded-2xl border transition-colors disabled:cursor-wait ${
          liked ? 'border-rose-300 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:border-rose-300 hover:text-rose-500'
        } ${className}`}
      >
        <span aria-hidden="true" className={`inline-block text-lg ${pop ? 'motion-safe:animate-[heart-pop_0.3s_ease-out]' : ''}`}>
          {liked ? '♥' : '♡'}
        </span>
        <span aria-hidden="true" className="text-sm font-semibold tabular-nums">
          {countText}
        </span>
      </button>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={label}
        onAnimationEnd={() => setPop(false)}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 font-semibold transition-colors disabled:cursor-wait ${sizeClasses} ${
          liked
            ? 'border-rose-400 bg-rose-50 text-rose-600'
            : 'border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:text-rose-500'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block ${pop ? 'motion-safe:animate-[heart-pop_0.3s_ease-out]' : ''}`}
        >
          {liked ? '♥' : '♡'}
        </span>
        <span>먹어보고 싶어요 {countText}</span>
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
