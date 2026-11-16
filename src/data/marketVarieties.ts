/**
 * 판매처 링크는 강원특별자치도 공식 온라인몰 '강원더몰'(gwdmall.kr) 검색 결과로 연결합니다.
 * 품종명으로 실제 상품이 검색되는 품종(미백2호·미흑찰·아리수)은 품종명으로, 나머지는 작물명으로 검색합니다(2026-11 확인).
 */
import type { MarketVariety } from '../types/market';

export const MARKET_VARIETIES: MarketVariety[] = [
  {
    crop: 'potato',
    varietyName: '선풍',
    image: '/images/market/potato-seonpung.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EA%B0%90%EC%9E%90',
    isFullCard: true,
  },
  {
    crop: 'potato',
    varietyName: '장원',
    image: '/images/market/potato-jangwon.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EA%B0%90%EC%9E%90',
    isFullCard: true,
  },
  {
    crop: 'potato',
    varietyName: '포슬이',
    image: '/images/market/potato-poseuli.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EA%B0%90%EC%9E%90',
    isFullCard: true,
  },
  {
    crop: 'potato',
    varietyName: '풍농',
    image: '/images/market/potato-pungnong.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EA%B0%90%EC%9E%90',
    isFullCard: true,
  },
  {
    crop: 'potato',
    varietyName: '자미',
    image: '/images/market/potato-jami.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EA%B0%90%EC%9E%90',
    isFullCard: true,
  },

  {
    crop: 'corn',
    varietyName: '미백2호',
    image: '/images/market/corn-mibaek2.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%AF%B8%EB%B0%B12%ED%98%B8',
    isFullCard: true,
  },
  {
    crop: 'corn',
    varietyName: '미흑찰',
    image: '/images/market/corn-miheukchal.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%AF%B8%ED%9D%91%EC%B0%B0',
    isFullCard: true,
  },
  {
    crop: 'corn',
    varietyName: '흑점 2호',
    image: '/images/market/corn-heukjeom2.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%B0%B0%EC%98%A5%EC%88%98%EC%88%98',
    isFullCard: true,
  },
  {
    crop: 'corn',
    varietyName: '흑점 3호',
    image: '/images/market/corn-heukjeom3.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%B0%B0%EC%98%A5%EC%88%98%EC%88%98',
    isFullCard: true,
  },
  {
    crop: 'corn',
    varietyName: '황금맛찰',
    image: '/images/market/corn-hwanggeummatchal.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%B0%B0%EC%98%A5%EC%88%98%EC%88%98',
    isFullCard: true,
  },

  {
    crop: 'peach',
    varietyName: '옐로드림',
    image: '/images/market/peach-yellowdream.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B3%B5%EC%88%AD%EC%95%84',
    isFullCard: true,
  },
  {
    crop: 'peach',
    varietyName: '이노센스',
    image: '/images/market/peach-innocence.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B3%B5%EC%88%AD%EC%95%84',
    isFullCard: true,
  },
  {
    crop: 'peach',
    varietyName: '홍슬',
    image: '/images/market/peach-hongseul.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B3%B5%EC%88%AD%EC%95%84',
    isFullCard: true,
  },
  {
    crop: 'peach',
    varietyName: '설홍',
    image: '/images/market/peach-seolhong.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B3%B5%EC%88%AD%EC%95%84',
    isFullCard: true,
  },
  {
    crop: 'peach',
    varietyName: '마루황도',
    image: '/images/market/peach-maruhwangdo.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B3%B5%EC%88%AD%EC%95%84',
    isFullCard: true,
  },

  {
    crop: 'apple',
    varietyName: '썸머킹',
    image: '/images/market/apple-summerking.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%82%AC%EA%B3%BC',
    isFullCard: true,
  },
  {
    crop: 'apple',
    varietyName: '골든볼',
    image: '/images/market/apple-goldenball.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%82%AC%EA%B3%BC',
    isFullCard: true,
  },
  {
    crop: 'apple',
    varietyName: '아리수',
    image: '/images/market/apple-arisu.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%95%84%EB%A6%AC%EC%88%98',
    isFullCard: true,
  },
  {
    crop: 'apple',
    varietyName: '이지플',
    image: '/images/market/apple-ezfl.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%82%AC%EA%B3%BC',
    isFullCard: true,
  },
  {
    crop: 'apple',
    varietyName: '컬러플',
    image: '/images/market/apple-colorful.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EC%82%AC%EA%B3%BC',
    isFullCard: true,
  },

  {
    crop: 'cabbage',
    varietyName: '원교20054호',
    image: '/images/market/cabbage-wongyo20054.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B0%B0%EC%B6%94',
    isFullCard: true,
  },
  {
    crop: 'cabbage',
    varietyName: '원교 20049호',
    image: '/images/market/cabbage-wongyo20049.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B0%B0%EC%B6%94',
    isFullCard: true,
  },
  {
    crop: 'cabbage',
    varietyName: '원교20055호(FH112)',
    image: '/images/market/cabbage-fh112.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B0%B0%EC%B6%94',
    isFullCard: true,
  },
  {
    crop: 'cabbage',
    varietyName: '순정아삭',
    image: '/images/market/cabbage-sunjeongasak.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B0%B0%EC%B6%94',
    isFullCard: true,
  },
  {
    crop: 'cabbage',
    varietyName: '하라듀',
    image: '/images/market/cabbage-haradyu.png',
    marketUrl: 'https://www.gwdmall.kr/goods/search?search_text=%EB%B0%B0%EC%B6%94',
    isFullCard: true,
  },
];
