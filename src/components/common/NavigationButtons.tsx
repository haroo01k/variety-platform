import { Button } from './Button';

interface NavigationButtonsProps {
  showPrev: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
  /** "다음" 버튼 색상. 소비자 화면처럼 더 밝은 톤이 필요하면 'accent'를 씁니다. */
  nextVariant?: 'primary' | 'accent';
}

/**
 * 단계형 질문 화면 하단의 이전·다음 버튼.
 * 필수 답변이 없으면 nextDisabled로 "다음"을 비활성화합니다.
 * 농업인·소비자 화면 모두 이 컴포넌트를 그대로 써서 버튼 위치·간격을 통일합니다.
 */
export function NavigationButtons({
  showPrev,
  onPrev,
  onNext,
  nextDisabled,
  nextLabel = '다음',
  nextVariant = 'primary',
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-3">
      {showPrev && (
        <Button variant="secondary" onClick={onPrev} className="flex-1">
          이전
        </Button>
      )}
      <Button variant={nextVariant} onClick={onNext} disabled={nextDisabled} className="flex-1">
        {nextLabel}
      </Button>
    </div>
  );
}
