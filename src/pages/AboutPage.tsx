import { useRef, useState } from 'react';

interface TeamMember {
  name: string;
  email: string;
  department: string;
  studentId: string;
}

const TEAM_NAME = 'Team 깻잎삼김';

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: '김민주',
    email: 'luka70740@gmail.com',
    department: '식물자원응용과학전공',
    studentId: '202110324',
  },
  {
    name: '껫분르닛까몬',
    email: 'hueesim@gmail.com',
    department: '식물자원응용과학전공',
    studentId: '202310160',
  },
  {
    name: '김소윤',
    email: 'soyun037@naver.com',
    department: '식물자원응용과학전공',
    studentId: '202311688',
  },
  {
    name: '김태연',
    email: 'tykim3434@kangwon.ac.kr',
    department: '식물자원응용과학전공',
    studentId: '202312878',
  },
];

const TEAM_PHOTOS = ['/images/team-photo-1.jpg', '/images/team-photo-2.jpg'];

interface MemberFieldProps {
  label: string;
  value: string;
  /** 이메일처럼 띄어쓰기 없이 긴 값이 영역 밖으로 넘치지 않도록 아무 곳에서나 줄바꿈 */
  breakAll?: boolean;
}

/** 팀원 세부 항목 한 줄(항목명 + 값). 글머리표는 글꼴에 없는 ▪ 대신 CSS 사각형으로 그립니다. */
function MemberField({ label, value, breakAll = false }: MemberFieldProps) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[14px] font-bold text-slate-700">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-brand-green" />
        {label}
      </dt>
      <dd className={`mt-0.5 text-[15px] font-normal text-slate-600 ${breakAll ? 'break-all' : ''}`}>{value}</dd>
    </div>
  );
}

/** 소개 영역과 팀 영역이 같은 폭·여백을 쓰도록 맞추는 내부 컨테이너 클래스 */
const CONTENT_CLASS = 'relative z-10 mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8';

/**
 * 서비스 소개 및 팀원 소개 화면 (`/about`).
 * 상단 소개 영역 오른쪽에 새싹·해·흙 장식 그림(about-background.png)을 깔고,
 * 흙의 페이드가 구분선 아래 팀 소개 영역까지 자연스럽게 이어지도록 합니다.
 * 장식 그림의 크기·위치는 index.css의 `.about-intro` 규칙에서 조정합니다.
 */
export function AboutPage() {
  const [erroredPhotos, setErroredPhotos] = useState<Record<string, boolean>>({});
  // TEAM 소개는 새로고침할 때마다 접힌 상태로 시작합니다(상태를 저장하지 않음).
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const teamTitleRef = useRef<HTMLHeadingElement>(null);

  /**
   * 구분선의 이중 V 버튼으로 TEAM 소개를 펼치거나 접습니다.
   * - 펼칠 때: 펼침(0.5초)이 끝난 뒤 TEAM 제목이 화면 아래쪽에 가려져 있을 때만 구분선이 위쪽에 오도록 스크롤
   * - 접을 때: 이미 구분선 아래로 스크롤해 내려와 있었다면, 접히면서 화면이 튀지 않게 구분선으로 함께 스크롤
   * 동작 줄이기 설정이면 애니메이션·부드러운 스크롤 없이 즉시 처리합니다.
   */
  const toggleTeam = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
    const nextOpen = !isTeamOpen;
    setIsTeamOpen(nextOpen);

    if (nextOpen) {
      window.setTimeout(
        () => {
          const title = teamTitleRef.current;
          if (title && title.getBoundingClientRect().bottom > window.innerHeight - 24) {
            dividerRef.current?.scrollIntoView({ behavior, block: 'start' });
          }
        },
        prefersReducedMotion ? 0 : 500,
      );
    } else if (dividerRef.current && dividerRef.current.getBoundingClientRect().top < 0) {
      dividerRef.current.scrollIntoView({ behavior, block: 'start' });
    }
  };

  return (
    <div className="relative isolate flex-1 overflow-hidden">
      <section className="about-intro">
        <img
          src="/images/about/about-background.png"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="about-intro-art"
        />

        <div className={`about-intro-content ${CONTENT_CLASS} pt-12 sm:pt-16`}>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5f7f6c] sm:text-sm">ABOUT US</p>
          <h1 className="font-nanum-round mt-5 text-[28px] leading-[1.4] font-bold tracking-[-0.02em] text-brand-green-dark md:text-[40px]">
            우리 땅에 맞는 발견,
            <br />
            우리 식탁의 새로운 가능성.
          </h1>
          <div className="font-gowun-dodum mt-6 max-w-[34rem] space-y-5 text-[17px] leading-[1.8] font-normal text-[#3b6e4a] sm:mt-8 sm:space-y-6 md:text-[20px]">
            <p>
              농업인에게는 우리 지역에 맞는 품종을,
              <br />
              소비자에게는 새로운 먹거리의 발견을.
            </p>
            <p>
              기후에 맞는 품종과
              <br />그 가치를 알아보는 사람들을 연결합니다.
            </p>
          </div>
        </div>
      </section>

      <section className={`font-nanum-round ${CONTENT_CLASS} pb-16`}>
        {/* 구분선 + 가운데 펼침/접힘 버튼. scroll-mt: 스크롤로 맞출 때 구분선이 화면 위쪽에 살짝 보이도록 24px 여유 */}
        <div ref={dividerRef} className="scroll-mt-6 border-t border-brand-green/40">
          <button
            type="button"
            onClick={toggleTeam}
            aria-expanded={isTeamOpen}
            aria-controls="about-team-panel"
            className="mx-auto mt-2 flex min-h-[64px] min-w-[132px] flex-col items-center justify-center gap-0.5 rounded-xl px-4 py-2 text-brand-green-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            <span className={isTeamOpen ? undefined : 'about-scroll-arrow'}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`about-toggle-icon ${isTeamOpen ? 'rotate-180' : ''}`}
              >
                <path d="M6 6.5l6 5 6-5" />
                <path d="M6 12.5l6 5 6-5" />
              </svg>
            </span>
            <span className="text-[12px] font-bold text-[#5f7f6c]">
              {isTeamOpen ? 'TEAM 소개 접기' : 'TEAM 소개 보기'}
            </span>
          </button>
        </div>

        {/*
          펼침 영역: grid-template-rows 0fr↔1fr 전환으로 내용 높이(화면 폭에 따라 달라짐)에 맞춰
          0.5초 ease-in-out으로 펼치고 접습니다(index.css의 .about-team-panel).
          접혀 있을 때는 inert로 키보드 포커스·화면낭독기 접근을 막습니다.
        */}
        <div
          id="about-team-panel"
          className={`about-team-panel ${isTeamOpen ? 'is-open' : ''}`}
          inert={!isTeamOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="about-team-item pt-6 sm:pt-8">
              <h2
                ref={teamTitleRef}
                className="text-[24px] leading-[1.4] font-bold tracking-[-0.02em] text-brand-green-dark md:text-[28px]"
              >
                TEAM 깻잎삼김
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5f7f6c] sm:text-[15px]">
                강원대학교 식물자원응용과학전공
                <br />
                식물자원 취·창업 캡스톤디자인 · 지도교수 이세현
              </p>
            </div>

            {/*
              팀원 소개: 박스 없이 페이지 배경 위에 바로 배치하고 여백으로만 구분합니다.
              768px 미만 1열, 그 이상 2열.
            */}
            <ul className="about-team-item mt-10 grid grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
              {TEAM_MEMBERS.map((member) => (
                <li key={member.studentId} className="min-w-0">
                  <h3 className="text-[20px] leading-[1.4] font-bold text-slate-900">{member.name}</h3>
                  <dl className="mt-3 space-y-2.5">
                    <MemberField label="E-mail" value={member.email} breakAll />
                    <MemberField label="Department" value={member.department} />
                    <MemberField label="Student ID" value={member.studentId} />
                  </dl>
                </li>
              ))}
            </ul>

            <div className="about-team-item mt-8 grid grid-cols-2 gap-3 md:gap-5">
              {TEAM_PHOTOS.map((src) =>
                erroredPhotos[src] ? (
                  <div
                    key={src}
                    className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-50 text-[11px] text-slate-400"
                  >
                    팀 사진을 준비 중입니다.
                  </div>
                ) : (
                  <img
                    key={src}
                    src={src}
                    alt={`${TEAM_NAME} 단체 사진`}
                    onError={() => setErroredPhotos((prev) => ({ ...prev, [src]: true }))}
                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
