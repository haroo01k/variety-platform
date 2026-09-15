import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { RiskInfoCard } from '../../components/farmer/RiskInfoCard';
import { FARMER_VARIETIES } from '../../data/farmerVarieties';
import { CROPS } from '../../data/crops';
import { ROUTES } from '../../lib/routes';

const AUTO_ADVANCE_MS = 2400;

/**
 * 농업인 분석 화면.
 * 실제 분석 로직 없이 선택한 작물에 맞는 병해충/기후위험 안내를 보여주고,
 * 잠시 후 자동으로(또는 버튼으로) 결과 화면으로 이동합니다.
 */
export function FarmerAnalyzingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const cropId = searchParams.get('crop') ?? CROPS[0].id;
  const variety = FARMER_VARIETIES.find((item) => item.cropId === cropId) ?? FARMER_VARIETIES[0];
  const resultHref = `${ROUTES.farmerResult}?${searchParams.toString() || `crop=${cropId}`}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(resultHref, { replace: true });
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate, resultHref]);

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center md:py-16">
      <p className="text-sm font-semibold text-brand-green">2 / 3 단계</p>
      <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
        추천 품종을 분석하고 있어요
      </h1>
      <p className="max-w-sm text-sm text-slate-500">
        우리 농장 환경에 가장 잘 맞는 품종을 신중하게 분석하고 있어요.
      </p>

      <RiskInfoCard
        emoji={variety.emoji}
        colorClass={variety.colorClass}
        title={variety.riskTitle}
        description={variety.riskDescription}
      />

      <Button to={resultHref} variant="secondary">
        결과 보기 <span aria-hidden="true">→</span>
      </Button>
    </Container>
  );
}
