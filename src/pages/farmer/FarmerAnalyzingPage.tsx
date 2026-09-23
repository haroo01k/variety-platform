import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { PlaceholderImage } from '../../components/common/PlaceholderImage';
import { CROPS } from '../../data/crops';
import { ROUTES } from '../../lib/routes';
import type { FarmerAnswers, FarmerResult } from '../../types/farmer';

const AUTO_ADVANCE_MS = 1600;

interface LocationState {
  cropId: string;
  answers: FarmerAnswers;
  result: FarmerResult;
}

/**
 * 농업인 분석 화면.
 * FarmerConditionsPage에서 이미 계산된 결과(location.state)를 잠시 보여준 뒤
 * 결과 화면으로 넘겨줍니다. state가 없으면(새로고침 등) 조건 입력 화면으로 되돌립니다.
 */
export function FarmerAnalyzingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state) return;
    const timer = setTimeout(() => {
      navigate(ROUTES.farmerResult, { replace: true, state });
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate, state]);

  if (!state) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">입력한 조건을 찾을 수 없어요. 조건을 다시 입력해주세요.</p>
        <Button to={ROUTES.farmerConditions} variant="primary">
          조건 입력하기
        </Button>
      </Container>
    );
  }

  const crop = CROPS.find((c) => c.id === state.cropId) ?? CROPS[0];

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center md:py-16">
      <p className="text-sm font-semibold text-brand-green">2 / 3 단계</p>
      <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
        추천 품종을 분석하고 있어요
      </h1>
      <p className="max-w-sm text-sm text-slate-500">
        입력하신 지역·기후위험·용도 조건에 맞춰 {crop.name} 품종 데이터를 비교하고 있어요.
      </p>

      <PlaceholderImage
        emoji={crop.emoji}
        colorClass={crop.colorClass}
        className="mx-auto h-28 w-28 animate-pulse text-5xl"
      />

      <Button variant="secondary" onClick={() => navigate(ROUTES.farmerResult, { replace: true, state })}>
        결과 보기 <span aria-hidden="true">→</span>
      </Button>
    </Container>
  );
}
