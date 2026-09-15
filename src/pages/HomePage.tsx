import { Container } from '../components/common/Container';
import { SelectionCard } from '../components/common/SelectionCard';
import { ROUTES } from '../lib/routes';

/**
 * 공통 시작 화면.
 * 서비스를 소개하고 "농업인" / "소비자" 경로를 선택하게 합니다.
 */
export function HomePage() {
  return (
    <Container className="flex flex-1 flex-col justify-center gap-8 py-10 md:py-16">
      <section className="text-center">
        <h1 className="text-3xl font-extrabold leading-snug text-brand-green-dark sm:text-4xl">
          기후가 바뀌어도 좋은 먹거리는 계속될 수 있어요.
        </h1>
        <p className="mt-4 text-base text-slate-500">
          기후에 강한 새로운 작물 품종을 만나보세요. 지금, 더 건강한 내일의 식탁을 함께 만들어가요.
        </p>
      </section>

      <section aria-label="사용자 유형 선택" className="flex flex-col gap-4 sm:flex-row">
        <SelectionCard
          to={ROUTES.farmerConditions}
          icon="🧑‍🌾"
          title="농업인이세요?"
          description="지역, 작물, 기후위험, 재배 목적에 맞는 신품종을 추천받아요."
        />
        <SelectionCard
          to={ROUTES.consumerCrops}
          icon="🛍️"
          title="소비자세요?"
          description="작물별 취향 테스트로 나에게 맞는 신품종을 만나보세요."
        />
      </section>
    </Container>
  );
}
