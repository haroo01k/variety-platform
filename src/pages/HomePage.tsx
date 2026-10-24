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
        {/*
          배경: 하늘/언덕에서 캐릭터·밭 풍경까지 이어지는 일러스트.
          그림 윗변을 "캐릭터 여백 위쪽 - 원래 글 영역 높이(모바일 190px, sm 213px)"에 고정해,
          소개 글이 길어지면 그만큼 그림이 함께 내려가고 캐릭터 구도는 그대로 유지됩니다.
          (top = 100%(섹션 높이) - 캐릭터 여백 - 원래 글 영역 높이)
        */}
        <img
          src="/images/hero-farmer-consumer.png"
          alt="수확물 바구니를 든 농업인과 소비자 캐릭터"
          className="pointer-events-none absolute left-0 top-[calc(100%-300px-190px)] h-auto w-full max-w-none select-none sm:top-[calc(100%-340px-213px)]"
        />
        {/* 상단 텍스트 가독성을 위한 크림색 그라데이션 오버레이 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #fbf6ea 0%, rgba(251,246,234,0.92) 32%, rgba(251,246,234,0.55) 55%, rgba(251,246,234,0.08) 78%, rgba(251,246,234,0) 100%)',
          }}
        />

        <div className="relative px-4 pt-6 text-left sm:px-6 sm:pt-8">
          {/*
            제목만 10px 아래로(relative top: 주변 배치에 영향 없음). 행간 1.15로 줄을 바짝 붙입니다.
            제목↔설명 사이 보이는 간격(약 25px)은 설명 문단의 mt로 유지하고,
            행간을 줄여 낮아진 글 영역 높이는 설명 문단의 mb로 채워 배경 그림·아래 카드 위치를 그대로 둡니다.
          */}
          <h1 className="font-gangwon-power relative top-[10px] text-[30px] leading-[1.15] tracking-[-0.02em] text-[#20251F] sm:text-[34px]">
            기후가 바뀌어도
            <br />
            <span className="text-brand-green">좋은 먹거리는</span>
            <br />
            <span className="text-brand-green">계속될 수 있어요.</span>
          </h1>

          {/* 의미 단위 3줄. 마지막 문장은 좁은 화면에서 자연스럽게 줄바꿈됩니다. */}
          <p className="font-gowun-dodum mt-7.5 mb-[1.2em] text-[16px] leading-[1.3] tracking-[-0.02em] text-[#4A5A4E] sm:text-[17px]">
            기후에 강한 새로운 작물을
            <br />
            품종별로 만나보세요.
            <br />
            지금, 더 건강한 내일의 식탁을 함께 만들어가요.
          </p>
        </div>

        {/* 캐릭터가 온전히 드러나는 여백 (클릭 동작 없음, 이동은 하단 선택 카드에서만) */}
        <div aria-hidden="true" className="pointer-events-none relative h-[300px] sm:h-[340px]" />
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
          <h2 className="font-nanum-round mt-1 text-[15px] font-bold text-[#20251F]">농업인이세요?</h2>
          <p className="font-nanum-round text-[12px] font-normal leading-snug text-[#6F756C]">
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
          <h2 className="font-nanum-round mt-1 text-[15px] font-bold text-[#20251F]">소비자세요?</h2>
          <p className="font-nanum-round text-[12px] font-normal leading-snug text-[#6F756C]">
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

      <p className="mt-5 flex items-center justify-center gap-1.5 px-4 text-center text-[18px] leading-snug text-[#4F6B2A] min-[380px]:text-[19px] sm:px-6 md:text-[21px] lg:text-[24px]">
        <span aria-hidden="true" className="text-[22px] leading-none min-[380px]:text-[23px] md:text-[25px] lg:text-[29px]">🌿</span>
        <span className="font-handwriting-emotion">작은 선택이, 더 건강한 지구를 만듭니다.</span>
      </p>

      <p className="mt-2 px-4 pb-4 text-center text-[11px] leading-snug text-[#A3A89E] sm:px-6 sm:text-[12px]">
        © 2026 깻잎삼김 All rights reserved.
      </p>
    </div>
  );
}
