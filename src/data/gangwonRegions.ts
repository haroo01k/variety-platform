/**
 * 강원도 재배지역 지도에서 쓰는 시·군 메타데이터(이름표, 색상, 추천 지역 그룹 매핑, 고랭지 확인 여부).
 * 경계 좌표는 src/data/gangwonGeo.ts(자동 생성)에 있고, code(통계청 행정구역 코드)로 연결합니다.
 *
 * regionGroup은 기존 추천 로직(src/lib/farmerScoring.ts의 F1 지역 값)으로 변환할 그룹입니다.
 * - 백두대간 동쪽 해안 시·군 → 'gangwon-yeongdong' (강원 영동·동해안)
 * - 백두대간 서쪽 내륙 시·군 → 'gangwon-yeongseo' (강원 영서)
 * - 태백시는 백두대간 위에 걸쳐 있어 영동/영서 어느 쪽으로도 확정하지 않았습니다(null).
 *   일반 재배지로 답하면 사용자가 영동·영서 중 기준을 직접 고릅니다.
 *
 * highlandCheck: true는 "시·군 전체가 고랭지"라는 뜻이 아니라, 고랭지 재배지가 있어
 * 재배환경(고랭지/일반) 확인 질문을 먼저 보여준다는 뜻입니다. false인 시·군도 고지대 재배지가
 * 있을 수 있으므로 사용자가 직접 재배환경을 바꿀 수 있습니다(src/components/farmer/RegionMapStep.tsx).
 */
import type { RegionAnswer } from '../types/farmer';

export type GangwonRegionId =
  | 'chuncheon'
  | 'wonju'
  | 'gangneung'
  | 'donghae'
  | 'taebaek'
  | 'sokcho'
  | 'samcheok'
  | 'hongcheon'
  | 'hoengseong'
  | 'yeongwol'
  | 'pyeongchang'
  | 'jeongseon'
  | 'cheorwon'
  | 'hwacheon'
  | 'yanggu'
  | 'inje'
  | 'goseong'
  | 'yangyang';

export interface GangwonRegion {
  regionId: GangwonRegionId;
  /** 시·군 이름 */
  regionName: string;
  /** 통계청 행정구역 코드(gangwonGeo.ts와 연결) */
  code: string;
  /** 기존 추천 로직의 지역 그룹. 확정되지 않았으면 null */
  regionGroup: Extract<RegionAnswer, 'gangwon-yeongdong' | 'gangwon-yeongseo'> | null;
  /** 고랭지 재배지가 있어 재배환경 확인 질문을 먼저 보여줄지 여부 */
  highlandCheck: boolean;
  /** 지도 이름표와 선택 지역 표시에 쓰는 화면용 지역명(예: 강릉권). 식별·추천에는 regionId/regionName 사용 */
  labelName: string;
  /** 기본 파스텔 색상 */
  color: string;
}

export const GANGWON_REGIONS: GangwonRegion[] = [
  { regionId: 'cheorwon', regionName: '철원군', code: '32360', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '철원권', color: '#B9D98B' },
  { regionId: 'hwacheon', regionName: '화천군', code: '32370', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '화천권', color: '#A8D8B0' },
  { regionId: 'chuncheon', regionName: '춘천시', code: '32010', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '춘천권', color: '#D2E5A3' },
  { regionId: 'hongcheon', regionName: '홍천군', code: '32310', regionGroup: 'gangwon-yeongseo', highlandCheck: true, labelName: '홍천권', color: '#9CCFBD' },
  { regionId: 'wonju', regionName: '원주시', code: '32020', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '원주권', color: '#F4D99C' },
  { regionId: 'hoengseong', regionName: '횡성군', code: '32320', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '횡성권', color: '#A9D7C7' },
  { regionId: 'pyeongchang', regionName: '평창군', code: '32340', regionGroup: 'gangwon-yeongseo', highlandCheck: true, labelName: '평창권', color: '#8BC7BC' },
  { regionId: 'sokcho', regionName: '속초시', code: '32060', regionGroup: 'gangwon-yeongdong', highlandCheck: false, labelName: '속초권', color: '#A9D7F5' },
  { regionId: 'gangneung', regionName: '강릉시', code: '32030', regionGroup: 'gangwon-yeongdong', highlandCheck: true, labelName: '강릉권', color: '#80BDF3' },
  { regionId: 'donghae', regionName: '동해시', code: '32040', regionGroup: 'gangwon-yeongdong', highlandCheck: false, labelName: '동해권', color: '#A5D7E8' },
  { regionId: 'taebaek', regionName: '태백시', code: '32050', regionGroup: null, highlandCheck: true, labelName: '태백권', color: '#B5B9E8' },
  { regionId: 'yanggu', regionName: '양구군', code: '32380', regionGroup: 'gangwon-yeongseo', highlandCheck: false, labelName: '양구권', color: '#CFE8C0' },
  { regionId: 'inje', regionName: '인제군', code: '32390', regionGroup: 'gangwon-yeongseo', highlandCheck: true, labelName: '인제권', color: '#C3DDA6' },
  { regionId: 'goseong', regionName: '고성군', code: '32400', regionGroup: 'gangwon-yeongdong', highlandCheck: false, labelName: '고성권', color: '#C4CDF0' },
  { regionId: 'yangyang', regionName: '양양군', code: '32410', regionGroup: 'gangwon-yeongdong', highlandCheck: false, labelName: '양양권', color: '#B8E0E0' },
  { regionId: 'samcheok', regionName: '삼척시', code: '32070', regionGroup: 'gangwon-yeongdong', highlandCheck: true, labelName: '삼척권', color: '#F4CFB5' },
  { regionId: 'jeongseon', regionName: '정선군', code: '32350', regionGroup: 'gangwon-yeongseo', highlandCheck: true, labelName: '정선권', color: '#E3E7A9' },
  { regionId: 'yeongwol', regionName: '영월군', code: '32330', regionGroup: 'gangwon-yeongseo', highlandCheck: true, labelName: '영월권', color: '#EBC9D6' },
];

/**
 * 대표 고랭지 재배지 예시(안내 문구용). 강원도 전체 고랭지 재배지 목록이 아니며,
 * 이 목록에 없다고 고랭지가 아니라는 뜻도 아닙니다.
 */
export const HIGHLAND_AREAS: { city: string; area: string }[] = [
  { city: '평창군', area: '대관령면' },
  { city: '강릉시', area: '왕산면 안반데기' },
  { city: '태백시', area: '매봉산 일대' },
];

export const findGangwonRegion = (regionId: GangwonRegionId | null) =>
  GANGWON_REGIONS.find((region) => region.regionId === regionId) ?? null;
