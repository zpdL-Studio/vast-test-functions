/**
 * 미디어 파일 정보를 나타내는 클래스
 */
class MediaFile {
  /**
   * @param {Object} params
   * @param {string} params.url - 미디어 파일 URL
   * @param {'progressive'|'streaming'} [params.delivery='progressive'] - 전송 방식
   * @param {'video/mp4'} [params.type='video/mp4'] - MIME 타입
   * @param {number} [params.width=640] - 비디오 너비
   * @param {number} [params.height=360] - 비디오 높이
   * @param {number} [params.bitrate=500] - 비트레이트 (kbps)
   * @param {boolean} [params.scalable=true] - 크기 조절 가능 여부
   * @param {boolean} [params.maintainAspectRatio=true] - 화면비 유지 여부
   */
  constructor({
    url,
    delivery = 'progressive',
    type = 'video/mp4',
    width = 640,
    height = 360,
    bitrate = 500,
    scalable = true,
    maintainAspectRatio = true,
  }) {
    /** @type {string} */
    this.url = url;
    /** @type {'progressive'|'streaming'} */
    this.delivery = delivery;
    /** @type {'video/mp4'} */
    this.type = type;
    /** @type {number} */
    this.width = width;
    /** @type {number} */
    this.height = height;
    /** @type {number} */
    this.bitrate = bitrate;
    /** @type {boolean} */
    this.scalable = scalable;
    /** @type {boolean} */
    this.maintainAspectRatio = maintainAspectRatio;
  }

  /**
   * 객체를 MediaFile 인스턴스로 변환합니다.
   * @param {Object} obj - 변환할 객체
   * @return {MediaFile}
   */
  static fromObject(obj) {
    return new MediaFile(obj);
  }
}

/**
 * 트래킹 이벤트 정보를 나타내는 클래스
 */
class TrackingEvents {
  /**
   * @param {Object} params
   * @param {string} [params.start] - 재생 시작 트래킹 URL
   * @param {string} [params.firstQuartile] - 1/4 지점 트래킹 URL
   * @param {string} [params.midpoint] - 중간 지점 트래킹 URL
   * @param {string} [params.thirdQuartile] - 3/4 지점 트래킹 URL
   * @param {string} [params.complete] - 재생 완료 트래킹 URL
   */
  constructor({
    start,
    firstQuartile,
    midpoint,
    thirdQuartile,
    complete,
  } = {}) {
    /** @type {string|undefined} */
    this.start = start;
    /** @type {string|undefined} */
    this.firstQuartile = firstQuartile;
    /** @type {string|undefined} */
    this.midpoint = midpoint;
    /** @type {string|undefined} */
    this.thirdQuartile = thirdQuartile;
    /** @type {string|undefined} */
    this.complete = complete;
  }

  /**
   * 객체를 TrackingEvents 인스턴스로 변환합니다.
   * @param {Object} obj - 변환할 객체
   * @return {TrackingEvents}
   */
  static fromObject(obj) {
    return new TrackingEvents(obj);
  }
}

/**
 * 광고 데이터를 나타내는 클래스
 */
class AdData {
  /**
   * @param {Object} params
   * @param {string} params.id - 광고 고유 식별자
   * @param {string} params.title - 광고 제목
   * @param {string} [params.description] - 광고 설명
   * @param {string} [params.system] - 광고 시스템 이름
   * @param {MediaFile[]} params.mediaFiles - 미디어 파일 목록
   * @param {string} params.duration - 재생 시간 (HH:MM:SS 형식)
   * @param {string} [params.clickThrough] - 광고 클릭 시 이동할 URL
   * @param {string[]} [params.clickTracking] - 클릭 트래킹 URL 목록
   * @param {TrackingEvents} [params.trackingEvents] - 추가 트래킹 이벤트
   */
  constructor({
    id,
    title,
    description,
    system,
    mediaFiles,
    duration,
    clickThrough,
    clickTracking = [],
    trackingEvents = new TrackingEvents(),
  }) {
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.title = title;
    /** @type {string|undefined} */
    this.description = description;
    /** @type {string|undefined} */
    this.system = system;
    /** @type {MediaFile[]} */
    this.mediaFiles = mediaFiles.map(MediaFile.fromObject);
    /** @type {string} */
    this.duration = duration;
    /** @type {string|undefined} */
    this.clickThrough = clickThrough;
    /** @type {string[]} */
    this.clickTracking = clickTracking;
    /** @type {TrackingEvents} */
    this.trackingEvents = TrackingEvents.fromObject(trackingEvents);
  }

  /**
   * 객체를 AdData 인스턴스로 변환합니다.
   * @param {Object} obj - 변환할 객체
   * @return {AdData}
   */
  static fromObject(obj) {
    return new AdData(obj);
  }

  /**
   * 필수 필드가 모두 있는지 검증합니다.
   * @throws {Error} 필수 필드가 없을 경우 에러를 발생시킵니다.
   */
  validate() {
    if (!this.id) throw new Error('id는 필수 필드입니다.');
    if (!this.title) throw new Error('title은 필수 필드입니다.');
    if (!this.mediaFiles?.length) throw new Error('mediaFiles는 최소 1개 이상 필요합니다.');
    if (!this.duration) throw new Error('duration은 필수 필드입니다.');

    // duration 형식 검증 (HH:MM:SS)
    if (!/^\d{2}:\d{2}:\d{2}$/.test(this.duration)) {
      throw new Error('duration은 HH:MM:SS 형식이어야 합니다.');
    }
  }
}

/**
 * VAST 생성 설정을 나타내는 클래스
 */
class Config {
  /**
   * @param {Object} params
   * @param {string} params.trackingBaseUrl - 트래킹 서버 기본 URL
   */
  constructor({ trackingBaseUrl }) {
    /** @type {string} */
    this.trackingBaseUrl = trackingBaseUrl;
  }

  /**
   * 객체를 Config 인스턴스로 변환합니다.
   * @param {Object} obj - 변환할 객체
   * @return {Config}
   */
  static fromObject(obj) {
    return new Config(obj);
  }

  /**
   * 필수 필드가 모두 있는지 검증합니다.
   * @throws {Error} 필수 필드가 없을 경우 에러를 발생시킵니다.
   */
  validate() {
    if (!this.trackingBaseUrl) throw new Error('trackingBaseUrl은 필수 필드입니다.');

    try {
      new URL(this.trackingBaseUrl);
    } catch (e) {
      throw new Error('trackingBaseUrl은 유효한 URL이어야 합니다.');
    }
  }
}

module.exports = {
  MediaFile,
  TrackingEvents,
  AdData,
  Config,
};
