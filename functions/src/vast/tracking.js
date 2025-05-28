/**
 * 트래킹 이벤트 타입 정의
 */
const TrackingEventTypes = {
  // 비디오 재생 관련 이벤트
  START: 'start',
  FIRST_QUARTILE: 'firstQuartile',
  MIDPOINT: 'midpoint',
  THIRD_QUARTILE: 'thirdQuartile',
  COMPLETE: 'complete',

  // 사용자 상호작용 이벤트
  CLICK: 'click',
  CLOSE: 'close',

  // 기타 이벤트
  IMPRESSION: 'impression',
  ERROR: 'error',
};

/**
 * 트래킹 URL 생성기 클래스
 */
class TrackingUrlBuilder {
  /**
   * @param {string} baseUrl - 트래킹 서버 기본 URL
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * 트래킹 URL을 생성합니다.
   * @param {string} event - 이벤트 타입
   * @param {Object} params - URL 파라미터
   * @return {string} 생성된 트래킹 URL
   */
  buildUrl(event, params = {}) {
    const url = new URL(this.baseUrl);

    // 기본 파라미터 추가
    url.searchParams.append('event', event);

    // 추가 파라미터 설정
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    return url.toString();
  }

  /**
   * 노출 트래킹 URL을 생성합니다.
   * @param {string} adId - 광고 ID
   * @param {Object} params - 추가 파라미터
   * @return {string} 노출 트래킹 URL
   */
  createImpressionUrl(adId, params = {}) {
    return this.buildUrl(TrackingEventTypes.IMPRESSION, {
      adId,
      ...params,
    });
  }

  /**
   * 비디오 이벤트 트래킹 URL을 생성합니다.
   * @param {string} event - 비디오 이벤트 타입
   * @param {string} adId - 광고 ID
   * @param {Object} params - 추가 파라미터
   * @return {string} 비디오 이벤트 트래킹 URL
   */
  createVideoEventUrl(event, adId, params = {}) {
    return this.buildUrl(event, {
      adId,
      ...params,
    });
  }

  /**
   * 클릭 트래킹 URL을 생성합니다.
   * @param {string} adId - 광고 ID
   * @param {Object} params - 추가 파라미터
   * @return {string} 클릭 트래킹 URL
   */
  createClickUrl(adId, params = {}) {
    return this.buildUrl(TrackingEventTypes.CLICK, {
      adId,
      ...params,
    });
  }
}

module.exports = {
  TrackingEventTypes,
  TrackingUrlBuilder,
};
