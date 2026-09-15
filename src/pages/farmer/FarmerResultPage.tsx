import { useSearchParams } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { PlaceholderImage } from '../../components/common/PlaceholderImage';
import { ScoreList } from '../../components/farmer/ScoreList';
import { FARMER_VARIETIES } from '../../data/farmerVarieties';
import { CROPS } from '../../data/crops';
import { ROUTES } from '../../lib/routes';

/**
 * 농업인 추천 결과 화면.
 * 선택한 작물에 해당하는 mock 추천 품종 정보를 보여줍니다.
 */
export function FarmerResultPage() {
  const [searchParams] = useSearchParams();
  const cropId = searchParams.get('crop') ?? CROPS[0].id;
  const variety = FARMER_VARIETIES.find((item) => item.cropId === cropId) ?? FARMER_VARIETIES[0];

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <p className="text-sm font-semibold text-brand-green">3 / 3 단계</p>
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          우리 농장에 맞는 신품종
        </h1>
        <p className="mt-2 text-sm text-slate-500">농장 조건을 분석한 추천 결과입니다.</p>
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <PlaceholderImage
          emoji={variety.emoji}
          colorClass={variety.colorClass}
          className="mx-auto h-32 w-32 text-6xl"
        />
        <div className="mt-4 rounded-2xl bg-brand-green-light px-4 py-2 text-center">
          <p className="text-lg font-bold text-brand-green-dark">{variety.name}</p>
        </div>
        <p className="mt-3 text-sm text-slate-500">{variety.summary}</p>

        <ScoreList variety={variety} />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {/* TODO: 추천 근거 상세 화면은 다음 단계에서 구현 */}
          <Button variant="primary" className="flex-1">
            추천 근거 보기 <span aria-hidden="true">→</span>
          </Button>
          <Button variant="secondary" className="flex-1" to={ROUTES.farmerConditions}>
            다른 품종 비교
          </Button>
        </div>
      </div>
    </Container>
  );
}
