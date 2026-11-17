import { ChevronRightIcon } from '../common/icons';
import type { VarietyRecord } from '../../types/variety';

/**
 * 농업인 결과 카드 아래 "이 품종으로 시작해 볼까요?" 안내.
 * 추천을 실제 재배로 잇는 공식 창구(농업기술센터·종자 공급처·농사로 품종정보)를 보여줍니다.
 * 링크는 모두 공공기관 페이지이거나, 시·군 농업기술센터 위치를 찾는 지도 검색입니다.
 */

interface FarmerNextStepsProps {
  variety: VarietyRecord;
  /** 지역 문항에서 고른 시·군 이름(예: 춘천시). 모르면 null */
  regionName: string | null;
}

/** 전국 농업기술원·시군 농업기술센터 목록(농촌진흥청) */
const RDA_LOCAL_ORGS_URL = 'https://www.rda.go.kr/localOrgAllView.do';
/** 농사로 품종 종합정보 */
const NONGSARO_VARIETY_URL = 'https://www.nongsaro.go.kr/portal/ps/psa/psab/psabf/spciesRsrchLst.ps?menuId=PS65425';
/** 강원특별자치도농업기술원 */
const GANGWON_ARES_URL = 'https://www.ares.gangwon.kr/';

/**
 * 품종별 종자 공급 정보(기사·기관 발표로 확인된 것만). 없으면 농업기술센터 문의로 안내합니다.
 * - 미백2호·미흑찰·흑점2호: 강원특별자치도농업기술원 옥수수연구소가 우량종자를 농가에 공급(세계일보 2026.6)
 * - 황금맛찰: 괴산군이 종자 보급, 2027년부터 민간업체 공급 예정(농촌진흥청 발표, 푸드투데이)
 */
const SEED_SOURCES: Record<string, { text: string; url?: string; linkLabel?: string }> = {
  미백2호: { text: '강원특별자치도농업기술원 옥수수연구소(홍천)에서 우량종자를 농가에 공급해요.', url: GANGWON_ARES_URL, linkLabel: '강원농업기술원' },
  미흑찰: { text: '강원특별자치도농업기술원 옥수수연구소(홍천)에서 우량종자를 농가에 공급해요.', url: GANGWON_ARES_URL, linkLabel: '강원농업기술원' },
  흑점2호: { text: '강원특별자치도농업기술원 옥수수연구소(홍천)에서 우량종자를 농가에 공급해요.', url: GANGWON_ARES_URL, linkLabel: '강원농업기술원' },
  황금맛찰: { text: '충북 괴산군이 종자를 보급하고 있고, 2027년부터는 민간 종자업체에서도 살 수 있을 예정이에요.' },
};

interface StepLink {
  icon: string;
  tint: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export function FarmerNextSteps({ variety, regionName }: FarmerNextStepsProps) {
  const seed = SEED_SOURCES[variety.name];
  const centerName = regionName ? `${regionName} 농업기술센터` : null;

  const links: StepLink[] = [
    centerName
      ? {
          icon: '📍',
          tint: 'bg-brand-green-light',
          title: `${centerName}에 물어보기`,
          description: '종자 공급 신청, 재배 교육·상담을 받을 수 있어요.',
          href: `https://map.naver.com/p/search/${encodeURIComponent(centerName)}`,
          cta: '지도에서 위치 보기',
        }
      : {
          icon: '📍',
          tint: 'bg-brand-green-light',
          title: '가까운 농업기술센터 찾기',
          description: '종자 공급 신청, 재배 교육·상담을 받을 수 있어요.',
          href: RDA_LOCAL_ORGS_URL,
          cta: '전국 기관 목록',
        },
    {
      icon: '🌾',
      tint: 'bg-brand-yellow/20',
      title: '종자·묘목 구하기',
      description: seed?.text ?? `${variety.name} 종자·묘목 구입처는 가까운 농업기술센터에 문의하면 가장 정확해요.`,
      href: seed?.url ?? RDA_LOCAL_ORGS_URL,
      cta: seed?.linkLabel ?? '농업기술원·센터 목록',
    },
    {
      icon: '📖',
      tint: 'bg-[#E8F1FB]',
      title: '농사로에서 품종 더 알아보기',
      description: '농촌진흥청 품종 종합정보에서 품종 특성과 재배법을 볼 수 있어요.',
      href: NONGSARO_VARIETY_URL,
      cta: '농사로 품종정보',
    },
  ];

  return (
    <section aria-labelledby="next-steps-title" className="mx-auto flex w-full max-w-[520px] flex-col gap-3">
      <div>
        <h2 id="next-steps-title" className="text-lg font-extrabold text-brand-green-dark">
          🌱 이렇게 시작해 보세요
        </h2>
      </div>

      <ol className="divide-y divide-[#F0E9D8] overflow-hidden rounded-2xl border border-[#F0E9D8] bg-white">
        {links.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#FBF8EF] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
            >
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${link.tint}`}
              >
                {link.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#20251F]">{link.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{link.description}</span>
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
