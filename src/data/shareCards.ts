/**
 * 저장·공유용 품종 카드 이미지(최종 승인 PNG). 화면의 카드 UI는 그대로 두고,
 * 저장·공유 버튼을 누를 때만 이 PNG를 그대로 내려받거나 공유합니다(새로 그리거나 캡처하지 않음).
 * 품종 데이터의 이름에는 "썸머킹(Summer King)"처럼 영문 표기가 붙어 있어, 품종 ID로 연결합니다.
 * 여기에 없는 품종은 기존 저장·공유 방식을 그대로 씁니다.
 */
export interface ShareCardImage {
  /** public 폴더 기준 경로 */
  src: string;
  /** 내려받을 때 쓸 파일명 */
  fileName: string;
}

export const SHARE_CARD_IMAGES: Record<string, ShareCardImage> = {
  // 원교20054호 (중생종)
  'CAB-01': { src: '/images/share-cards/cabbage/cabbage-wongyo20054-card.png', fileName: '배추_신품종카드_원교20054호.png' },
  // 원교20049호 (중생종)
  'CAB-02': { src: '/images/share-cards/cabbage/cabbage-wongyo20049-card.png', fileName: '배추_신품종카드_원교20049호.png' },
  // FH112 (중생종)
  'CAB-03': { src: '/images/share-cards/cabbage/cabbage-fh112-card.png', fileName: '배추_신품종카드_FH112.png' },
  // 순정아삭 (조중생종)
  'CAB-04': { src: '/images/share-cards/cabbage/cabbage-sunjeongasak-card.png', fileName: '배추_신품종카드_순정아삭.png' },
  // 하라듀 (조생종, 노란색 캐릭터 최종본)
  'CAB-05': { src: '/images/share-cards/cabbage/cabbage-haradyu-card.png', fileName: '배추_신품종카드_하라듀.png' },
  // 선풍 (중생종)
  'POT-01': { src: '/images/share-cards/potato/potato-seonpung-card.png', fileName: '감자_신품종카드_선풍.png' },
  // 장원 (조중생종)
  'POT-02': { src: '/images/share-cards/potato/potato-jangwon-card.png', fileName: '감자_신품종카드_장원.png' },
  // 포슬이 (조생종)
  'POT-03': { src: '/images/share-cards/potato/potato-poseuri-card.png', fileName: '감자_신품종카드_포슬이.png' },
  // 풍농 (중생종)
  'POT-04': { src: '/images/share-cards/potato/potato-pungnong-card.png', fileName: '감자_신품종카드_풍농.png' },
  // 자미 (중생종)
  'POT-05': { src: '/images/share-cards/potato/potato-jami-card.png', fileName: '감자_신품종카드_자미.png' },
  // 미백2호 (중생종)
  'COR-01': { src: '/images/share-cards/corn/corn-mibaek2-card.png', fileName: '옥수수_신품종카드_미백2호.png' },
  // 미흑찰 (중만생종)
  'COR-02': { src: '/images/share-cards/corn/corn-miheukchal-card.png', fileName: '옥수수_신품종카드_미흑찰.png' },
  // 흑점2호 (중생종)
  'COR-03': { src: '/images/share-cards/corn/corn-heukjeom2-card.png', fileName: '옥수수_신품종카드_흑점2호.png' },
  // 흑점3호 (중생종)
  'COR-04': { src: '/images/share-cards/corn/corn-heukjeom3-card.png', fileName: '옥수수_신품종카드_흑점3호.png' },
  // 황금맛찰 (중생종)
  'COR-05': { src: '/images/share-cards/corn/corn-hwanggeummatchal-card.png', fileName: '옥수수_신품종카드_황금맛찰.png' },
  // 옐로드림 (조생종)
  'PEA-01': { src: '/images/share-cards/peach/peach-yellowdream-card.png', fileName: '복숭아_신품종카드_옐로드림.png' },
  // 이노센스 (중생종)
  'PEA-02': { src: '/images/share-cards/peach/peach-innocence-card.png', fileName: '복숭아_신품종카드_이노센스.png' },
  // 홍슬 (중생종)
  'PEA-03': { src: '/images/share-cards/peach/peach-hongsul-card.png', fileName: '복숭아_신품종카드_홍슬.png' },
  // 설홍 (만생종)
  'PEA-04': { src: '/images/share-cards/peach/peach-seolhong-card.png', fileName: '복숭아_신품종카드_설홍.png' },
  // 마루황도 (만생종)
  'PEA-05': { src: '/images/share-cards/peach/peach-maruhwangdo-card.png', fileName: '복숭아_신품종카드_마루황도.png' },
  // 썸머킹 (조생종)
  'APP-01': { src: '/images/share-cards/apple/summer-king-card.png', fileName: '사과_신품종카드_썸머킹.png' },
  // 골든볼 (조생종)
  'APP-02': { src: '/images/share-cards/apple/golden-ball-card.png', fileName: '사과_신품종카드_골든볼.png' },
  // 아리수 (중생종)
  'APP-03': { src: '/images/share-cards/apple/arisu-card.png', fileName: '사과_신품종카드_아리수.png' },
  // 이지플 (중생종)
  'APP-04': { src: '/images/share-cards/apple/easyple-card.png', fileName: '사과_신품종카드_이지플.png' },
  // 컬러플 (중만생종)
  'APP-05': { src: '/images/share-cards/apple/colorple-card.png', fileName: '사과_신품종카드_컬러플.png' },
};

export const findShareCardImage = (varietyId: string): ShareCardImage | undefined => SHARE_CARD_IMAGES[varietyId];
