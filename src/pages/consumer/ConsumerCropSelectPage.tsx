import { Container } from '../../components/common/Container';
import { CropOptionCard } from '../../components/consumer/CropOptionCard';
import { CROPS } from '../../data/crops';

/**
 * 소비자 작물 선택 화면.
 * 작물을 누르면 해당 작물의 추천 카드 화면으로 이동합니다.
 */
export function ConsumerCropSelectPage() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-6 py-8 md:py-12">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          어떤 작물이 궁금하세요?
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          기후에 더 강하고, 더 맛있는 새로운 품종을 소개할게요.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3" role="list" aria-label="작물 선택">
        {CROPS.map((crop) => (
          <CropOptionCard key={crop.id} crop={crop} />
        ))}
      </div>
    </Container>
  );
}
