import { Link } from 'react-router-dom';
import { ROUTES } from '../lib/routes';

/**
 * 서비스 첫 화면(랜딩).
 * 헤더 아래부터 메인 카피, 설명, 캐릭터 일러스트까지 하나의 hero section으로
 * 이어지고, 선택 카드가 그 하단에 겹쳐지는 구성입니다. 모바일 우선(390px 기준)이며,
 * 넓은 화면에서는 모바일형 레이아웃을 중앙에 고정합니다.
 *
 * 첫 화면 높이 맞춤: 전체 높이를 `100dvh - 헤더 높이`로 두고, 캐릭터 여백이
 * 최대 높이(300/340px)에서 최소 160px까지 줄어들며 선택 카드가 한 화면에 들어오게
 * 합니다. 그보다 화면이 낮으면 최소 높이(580/610px)를 유지해 세로 스크롤됩니다.
 */
const HEADER_HEIGHT = '57px'; // Header: py-3(24px) + 2줄 로고(31.25px) + 하단 border(1px)

export function HomePage() {
  return (
    <div
      className="mx-auto flex min-h-[580px] w-full max-w-[430px] flex-col sm:min-h-[610px] sm:max-w-[480px]"
      style={{ height: `calc(100dvh - ${HEADER_HEIGHT})` }}
    >
      <section aria-label="랜딩 소개" className="relative flex min-h-0 flex-col overflow-hidden">
        {/* 배경: 하늘/언덕에서 캐릭터·밭 풍경까지 이어지는 일러스트 */}
        <img
          src="/images/hero-farmer-consumer.png"
          alt="수확물 바구니를 든 농업인과 소비자 캐릭터"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-top"
        />
        {/* 상단 텍스트 가독성을 위한 크림색 그라데이션 오버레이 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #fbf6ea 0%, rgba(251,246,234,0.92) 32%, rgba(251,246,234,0.55) 55%, rgba(251,246,234,0.08) 78%, rgba(251,246,234,0) 100%)',
          }}
        />

        <div className="relative shrink-0 px-4 pb-2 pt-[clamp(0.75rem,3dvh,1.5rem)] text-left sm:px-6 sm:pt-[clamp(1rem,3.5dvh,2rem)]">
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

        {/* 캐릭터가 드러나는 여백 (클릭 동작 없음). 화면 높이가 부족하면 160px까지 줄어듦 */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative h-[300px] min-h-[160px] shrink sm:h-[340px]"
        />
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

      <p className="mt-[clamp(0.5rem,2.4dvh,1.25rem)] flex items-center justify-center gap-1.5 px-4 text-center text-[18px] leading-snug text-[#4F6B2A] min-[380px]:text-[19px] sm:px-6 md:text-[21px] lg:text-[24px]">
        <span aria-hidden="true" className="text-[22px] leading-none min-[380px]:text-[23px] md:text-[25px] lg:text-[29px]">🌿</span>
        <span className="font-handwriting-emotion">작은 선택이, 더 건강한 지구를 만듭니다.</span>
      </p>
    </div>
  );
}
