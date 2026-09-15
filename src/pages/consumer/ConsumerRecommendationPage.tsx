import { useParams } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { RecommendationCard } from '../../components/consumer/RecommendationCard';
import { CONSUMER_VARIETIES } from '../../data/consumerVarieties';
import { CROPS } from '../../data/crops';

/**
 * 소비자 추천 카드 화면.
 * URL의 cropId에 해당하는 mock 추천 카드를 보여줍니다.
 */
export function ConsumerRecommendationPage() {
  const { cropId } = useParams<{ cropId: string }>();
  const variety =
    CONSUMER_VARIETIES.find((item) => item.cropId === cropId) ?? CONSUMER_VARIETIES[0];
  const crop = CROPS.find((item) => item.id === variety.cropId);

  return (
    <Container className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          당신에게 딱 맞는 작물을 찾았어요!
        </h1>
        <p className="mt-2 text-sm text-slate-500">기후에도, 식탁에도 든든한 친구를 만나보세요.</p>
      </header>

      <RecommendationCard variety={variety} cropName={crop?.name ?? ''} />
    </Container>
  );
}
