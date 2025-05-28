const VastBuilder = require('./builder');
const VastTemplates = require('./templates');
const { TrackingEventTypes } = require('./tracking');
const { MediaFile, TrackingEvents, AdData, Config } = require('./types');

/**
 * VAST XML 생성 모듈
 * @module vast
 */
module.exports = {
  /**
   * VAST XML을 생성합니다.
   * @param {Object|Config} config - VAST 생성 설정
   * @param {Object|AdData} adData - 광고 데이터
   * @return {string} VAST XML 문자열
   *
   * @example
   * const vastXml = createVastXml({
   *   trackingBaseUrl: 'https://tracking.example.com'
   * }, {
   *   id: '12345',
   *   title: '샘플 비디오 광고',
   *   description: '광고 설명',
   *   mediaFiles: [{
   *     url: 'https://example.com/video.mp4',
   *     width: 1920,
   *     height: 1080,
   *     bitrate: 2000
   *   }],
   *   duration: '00:00:30',
   *   clickThrough: 'https://example.com/landing',
   *   clickTracking: ['https://tracking.example.com/click'],
   *   trackingEvents: {
   *     start: 'https://tracking.example.com/start',
   *     complete: 'https://tracking.example.com/complete'
   *   }
   * });
   */
  createVastXml(config, adData) {
    // 설정과 광고 데이터를 클래스 인스턴스로 변환
    const configInstance = config instanceof Config ? config : Config.fromObject(config);
    const adDataInstance = adData instanceof AdData ? adData : AdData.fromObject(adData);

    // 유효성 검사
    configInstance.validate();
    adDataInstance.validate();

    const builder = new VastBuilder(configInstance);

    // 기본 정보 설정
    builder.setAdInfo({
      id: adDataInstance.id,
      title: adDataInstance.title,
      description: adDataInstance.description,
      system: adDataInstance.system,
    });

    // 미디어 파일 추가
    adDataInstance.mediaFiles.forEach((mediaFile) => {
      builder.addMediaFile(mediaFile);
    });

    // 재생 시간 설정
    builder.setDuration(adDataInstance.duration);

    // 클릭 URL 설정
    builder.setClickUrls({
      clickThrough: adDataInstance.clickThrough,
      clickTracking: adDataInstance.clickTracking,
    });

    // 기본 트래킹 이벤트 추가
    builder.addDefaultTracking(adDataInstance.id);

    // 추가 트래킹 이벤트 설정
    if (adDataInstance.trackingEvents) {
      Object.entries(adDataInstance.trackingEvents).forEach(([event, url]) => {
        if (url) {
          builder.addTrackingEvent(event, url);
        }
      });
    }

    return builder.build();
  },

  // 타입 클래스들 노출
  MediaFile,
  TrackingEvents,
  AdData,
  Config,

  // 상수 및 유틸리티 노출
  TrackingEventTypes,
  VastTemplates,
};
