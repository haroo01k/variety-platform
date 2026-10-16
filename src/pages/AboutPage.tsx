import { useState } from 'react';
import { Container } from '../components/common/Container';

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

/**
 * 서비스 소개 및 팀원 소개 화면 (`/about`).
 * 카드형 UI가 아니라, 연구실 구성원 소개 페이지처럼 텍스트 중심으로 구성합니다.
 */
const TEAM_PHOTOS = ['/images/team-photo-1.jpg', '/images/team-photo-2.jpg'];

export function AboutPage() {
  const [erroredPhotos, setErroredPhotos] = useState<Record<string, boolean>>({});

  return (
    <Container className="flex-1 py-8 sm:py-10">
      <header>
        <h1 className="text-3xl font-extrabold text-brand-green-dark sm:text-4xl">TEAM 깻잎삼김</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          기후에 강한 신품종과 소비자를 연결하는 서비스를 만들고 있습니다.
        </p>
      </header>

      {/*
        팀원 소개: 768px 이하에서는 1열, 그보다 넓으면 2열 × 2행.
        가로 간격(gap-x-12)과 행 사이 간격(py-6 위아래 합 48px)을 같게 맞추고,
        구분선은 행 단위로 각 칸 위에 그어 2열에서도 열마다 정렬되도록 합니다.
      */}
      <ul className="mt-9 grid grid-cols-1 gap-x-12 min-[769px]:grid-cols-2">
        {TEAM_MEMBERS.map((member) => (
          <li
            key={member.studentId}
            className="min-w-0 border-t border-slate-100 py-6 first:border-t-0 first:pt-0 min-[769px]:nth-2:border-t-0 min-[769px]:nth-2:pt-0"
          >
            <h2 className="text-xl font-extrabold text-slate-900">{member.name}</h2>
            <dl className="mt-3 space-y-2.5 text-sm text-slate-600">
              <div>
                <dt className="font-bold text-slate-700">
                  <span className="text-brand-green">▪</span> E-mail
                </dt>
                <dd className="mt-0.5 break-all">{member.email}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-700">
                  <span className="text-brand-green">▪</span> Department
                </dt>
                <dd className="mt-0.5">{member.department}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-700">
                  <span className="text-brand-green">▪</span> Student ID
                </dt>
                <dd className="mt-0.5">{member.studentId}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <section className="mt-10 border-t border-slate-100 pt-8">
        <h2 className="text-base font-bold text-brand-green-dark">{TEAM_NAME}</h2>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {TEAM_PHOTOS.map((src) =>
            erroredPhotos[src] ? (
              <div
                key={src}
                className="flex h-24 items-center justify-center rounded-2xl bg-slate-50 text-[11px] text-slate-400 sm:h-28"
              >
                팀 사진을 준비 중입니다.
              </div>
            ) : (
              <img
                key={src}
                src={src}
                alt={`${TEAM_NAME} 단체 사진`}
                onError={() => setErroredPhotos((prev) => ({ ...prev, [src]: true }))}
                className="h-24 w-full rounded-2xl object-cover sm:h-28"
              />
            ),
          )}
        </div>
      </section>
    </Container>
  );
}
