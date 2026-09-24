import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

/**
 * 서비스 첫 화면(랜딩).
 * 헤더 아래부터 메인 카피, 설명, 캐릭터 일러스트까지 하나의 hero section으로
 * 이어지고, 선택 카드가 그 하단에 겹쳐지는 구성입니다. 모바일 우선(390px 기준)이며,
 * 넓은 화면에서는 모바일형 레이아웃을 중앙에 고정합니다.
 */
export function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col sm:max-w-[480px]">
      <section aria-label="랜딩 소개" className="relative overflow-hidden">
        {/* 배경: 하늘/언덕에서 캐릭터·밭 풍경까지 이어지는 일러스트 */}
        <img
          src="/images/hero-farmer-consumer.png"
          alt="수확물 바구니를 든 농업인과 소비자 캐릭터"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        {/* 상단 텍스트 가독성을 위한 크림색 그라데이션 오버레이 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #fbf6ea 0%, rgba(251,246,234,0.92) 32%, rgba(251,246,234,0.55) 55%, rgba(251,246,234,0.08) 78%, rgba(251,246,234,0) 100%)',
          }}
        />

        <div className="relative px-4 pb-2 pt-6 text-left sm:px-6 sm:pt-8">
          <h1 className="text-[30px] font-extrabold leading-[1.2] tracking-tight text-[#20251F] sm:text-[34px]">
            기후가 바뀌어도
            <br />
            <span className="text-brand-green">좋은 먹거리는</span>
            <br />
            <span className="text-brand-green">계속될 수 있어요.</span>
          </h1>

          <p className="mt-3 text-[14px] leading-snug text-[#6F756C]">
            기후에 강한 새로운 작물을 품종별로 만나보세요.
            <br />
            지금, 더 건강한 내일의 식탁을 함께 만들어가요.
          </p>
        </div>

        {/* 캐릭터가 온전히 드러나는 여백 + 클릭 영역 */}
        <div className="relative h-[300px] sm:h-[340px]">
          <Link
            to={ROUTES.farmerConditions}
            aria-label="농업인 화면으로 이동"
            className="absolute inset-y-0 left-0 w-1/2 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          />
          <Link
            to={ROUTES.consumer}
            aria-label="소비자 화면으로 이동"
            className="absolute inset-y-0 right-0 w-1/2 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          />
        </div>
      </section>

      <section
        aria-label="사용자 유형 선택"
        className="relative z-10 -mt-10 grid grid-cols-2 gap-2 px-4 sm:px-6"
      >
        <Link
          to={ROUTES.farmerConditions}
          className="flex flex-col items-center gap-1.5 rounded-[28px] border border-[#ECE6D6] bg-[#FBF8EF] px-3 pb-4 pt-5 text-center shadow-sm transition-colors hover:border-[#DDD5BE]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <img
              src="/images/farmer-icon.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain"
            />
          </span>
          <h2 className="mt-1 text-[15px] font-bold text-[#20251F]">농업인이세요?</h2>
          <p className="text-[12px] leading-snug text-[#6F756C]">
            더 나은 농사를 위한
            <br />
            맞춤 정보를 만나보세요.
          </p>
          <span
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDEAE0] text-[#20251F]"
            aria-hidden="true"
          >
            →
          </span>
        </Link>

        <Link
          to={ROUTES.consumer}
          className="flex flex-col items-center gap-1.5 rounded-[28px] border border-brand-green-light bg-[#F1F8EE] px-3 pb-4 pt-5 text-center shadow-sm transition-colors hover:border-brand-green"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <img
              src="/images/consumer-icon.png"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain"
            />
          </span>
          <h2 className="mt-1 text-[15px] font-bold text-[#20251F]">소비자세요?</h2>
          <p className="text-[12px] leading-snug text-[#6F756C]">
            맛있는 변화,
            <br />
            지금부터 함께해요.
          </p>
          <span
            className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-white"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </section>

      <p className="mt-5 flex items-center justify-center gap-1.5 px-4 text-center text-xs text-brand-green/70 sm:px-6">
        <span aria-hidden="true">🌿</span>
        <span className="font-handwriting-emotion">작은 선택이, 더 건강한 지구를 만듭니다.</span>
      </p>
    </div>
  );
}
