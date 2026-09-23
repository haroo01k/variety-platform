import { useEffect, useState } from 'react';
import { getLikeCounts, getMyLikes, toggleLike } from '../../lib/likes';
import { getLocalLikedSet, setLocalLiked } from '../../lib/deviceId';

interface LikeButtonProps {
  varietyId: string;
  /** 작은 화면(미니 카드)에서는 'sm', 기본은 'md' */
  size?: 'md' | 'sm';
  /** true면 텍스트 없이 하트 아이콘만 보여줍니다(카드 저장·공유 버튼과 같은 크기의 액션 그룹용). */
  iconOnly?: boolean;
  className?: string;
}

/**
 * 소비자 화면 전용 "좋아요" 하트 버튼. 네이버 좋아요처럼 토글 방식이며,
 * 로그인 없이 기기별 익명 ID(device_id)로 Supabase에 기록합니다.
 * - 하트 채움/개수는 실제 서버 집계값을 그대로 표시합니다(클라이언트에서 임의로 더하지 않음).
 * - 서버 요청이 실패하면 직전 상태로 되돌리고 재시도 안내만 보여줍니다.
 */
export function LikeButton({ varietyId, size = 'md', iconOnly = false, className = '' }: LikeButtonProps) {
  const [liked, setLiked] = useState(() => getLocalLikedSet().has(varietyId));
  const [count, setCount] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [countsResult, likedResult] = await Promise.all([
        getLikeCounts([varietyId]),
        getMyLikes([varietyId]),
      ]);
      if (cancelled) return;

      setCount(countsResult.ok ? (countsResult.value[varietyId] ?? 0) : 0);

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

  const handleClick = async () => {
    if (pending) return;
    const prevLiked = liked;
    const prevCount = count ?? 0;
    const nextLiked = !liked;

    setPending(true);
    setError(null);
    setLiked(nextLiked);
    setCount(prevCount + (nextLiked ? 1 : -1));
    setPop(true);

    const result = await toggleLike(varietyId);
    if (result.ok) {
      setLiked(result.value.liked);
      setCount(result.value.likeCount);
      setLocalLiked(varietyId, result.value.liked);
    } else {
      setLiked(prevLiked);
      setCount(prevCount);
      setError('좋아요를 처리하지 못했어요. 다시 시도해주세요.');
    }
    setPending(false);
  };

  const displayCount = count ?? 0;
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const label = liked ? `좋아요 취소 (${displayCount}명)` : `좋아요 (${displayCount}명)`;

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={liked}
        aria-label={label}
        onAnimationEnd={() => setPop(false)}
        className={`flex h-11 items-center justify-center rounded-2xl border text-lg transition-colors disabled:cursor-wait ${
          liked ? 'border-rose-300 bg-rose-50 text-rose-500' : 'border-slate-200 bg-white text-slate-400 hover:border-rose-300 hover:text-rose-500'
        } ${className}`}
      >
        <span aria-hidden="true" className={`inline-block ${pop ? 'motion-safe:animate-[heart-pop_0.3s_ease-out]' : ''}`}>
          {liked ? '♥' : '♡'}
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
        <span>좋아요 {displayCount}</span>
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
