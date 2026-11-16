import { useState } from 'react';

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
      <dt className="flex items-center gap-1.5 fs-14 font-bold text-slate-700">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-brand-green" />
        {label}
      </dt>
      <dd className={`mt-0.5 fs-15 font-normal text-slate-600 ${breakAll ? 'break-all' : ''}`}>{value}</dd>
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
  return (
    // PC: 소개 영역이 (화면 높이 - 상단 메뉴) 남은 높이를 채우고, 그 아래에 TEAM 소개가 항상 펼쳐져 이어집니다.
    // overflow-hidden은 화면 폭보다 넓은 배경 그림의 가로 넘침을 자르기 위한 것입니다.
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      <section className="about-intro min-[769px]:flex-1">
        <img
          src="/images/about/about-background.png"
          alt=""
          aria-hidden="true"
          decoding="async"
          className="about-intro-art"
        />

        <div className={`about-intro-content ${CONTENT_CLASS} pt-12 sm:pt-16`}>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#5f7f6c] sm:text-sm">ABOUT US</p>
          <h1 className="font-nanum-round mt-5 fs-28 leading-[1.4] font-bold tracking-[-0.02em] text-brand-green-dark md:fs-40">
            우리 땅에 맞는 발견,
            <br />
            우리 식탁의 새로운 가능성.
          </h1>
          <div className="font-gowun-dodum mt-6 max-w-[34rem] space-y-5 fs-17 leading-[1.8] font-normal text-[#3b6e4a] sm:mt-8 sm:space-y-6 md:fs-20">
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

      {/* 하단 여백: 모바일은 기존처럼 항상 64px, PC는 펼침 영역 안에 두어 접혀 있을 때 높이를 차지하지 않게 함 */}
      <section className={`font-nanum-round ${CONTENT_CLASS} pb-16 min-[769px]:pb-0`}>
        {/* 구분선. scroll-mt: 스크롤로 맞출 때 구분선이 화면 위쪽에 살짝 보이도록 24px 여유 */}
        <div className="border-t border-brand-green/40" />

        {/*
          펼침 영역: grid-template-rows 0fr↔1fr 전환으로 내용 높이(화면 폭에 따라 달라짐)에 맞춰
          0.5초 ease-in-out으로 펼치고 접습니다(index.css의 .about-team-panel).
          접혀 있을 때는 inert로 키보드 포커스·화면낭독기 접근을 막습니다.
        */}
        {/* TEAM 소개는 접지 않고 항상 펼쳐 둡니다. */}
        <div id="about-team-panel">
          <div className="min-h-0 overflow-hidden">
            <div className="min-[769px]:pb-16">
              <div className="about-team-item pt-6 sm:pt-8">
                <h2
                  className="fs-24 leading-[1.4] font-bold tracking-[-0.02em] text-brand-green-dark md:fs-28"
                >
                  TEAM 깻잎삼김
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#5f7f6c] sm:fs-15">
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
                    <h3 className="fs-20 leading-[1.4] font-bold text-slate-900">{member.name}</h3>
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
                      className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-50 fs-11 text-slate-400"
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
        </div>
      </section>
    </div>
  );
}
