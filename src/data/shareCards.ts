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
