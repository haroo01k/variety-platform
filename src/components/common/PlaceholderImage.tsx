interface PlaceholderImageProps {
  /** 표시할 이모지 */
  emoji: string;
  /** 배경 Tailwind 클래스 (예: 'bg-amber-100'). hexColor가 있으면 무시됩니다. */
  colorClass?: string;
  /** 품종별 캐릭터색 HEX. 지정하면 colorClass 대신 인라인 배경색으로 사용합니다. */
  hexColor?: string;
  /** 크기 · 폰트 크기 등은 className으로 전달 (예: 'h-32 w-32 text-6xl') */
  className?: string;
  /** 의미 있는 이미지일 경우 대체 텍스트. 없으면 장식용으로 처리됩니다. */
  label?: string;
}

/**
 * 실제 이미지 파일이 준비되기 전까지 사용하는 임시 이미지 영역입니다.
 * 나중에 실제 사진/일러스트로 교체할 때는 이 컴포넌트를 쓰는 자리에서
 * <img src="..." /> 로 바꾸면 됩니다.
 */
export function PlaceholderImage({
  emoji,
  colorClass = 'bg-brand-green-light',
  hexColor,
  className = '',
  label,
}: PlaceholderImageProps) {
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={hexColor ? { backgroundColor: hexColor } : undefined}
      className={`flex items-center justify-center rounded-3xl ${hexColor ? '' : colorClass} ${className}`}
    >
      <span aria-hidden="true">{emoji}</span>
    </div>
  );
}
