const XmlUtils = require('../utils/xml');
const VastTemplates = require('./templates');
const { TrackingUrlBuilder, TrackingEventTypes } = require('./tracking');

/**
 * VAST XML 빌더 클래스
 */
class VastBuilder {
  /**
   * @param {Object} config - 빌더 설정
   * @param {string} config.trackingBaseUrl - 트래킹 서버 기본 URL
   */
  constructor(config) {
    this.template = VastTemplates.getBaseTemplate();
    this.trackingBuilder = new TrackingUrlBuilder(config.trackingBaseUrl);
  }

  /**
   * 광고 기본 정보를 설정합니다.
   * @param {Object} params - 광고 기본 정보
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  setAdInfo({
    id,
    title,
    description = '',
    system = 'MOTOV Ad Server',
  }) {
    const ad = this.template.VAST.Ad;
    ad['@id'] = id;
    ad.InLine.AdSystem = system;
    ad.InLine.AdTitle = title;
    ad.InLine.Description = description;

    // 노출 트래킹 URL 설정
    ad.InLine.Impression = XmlUtils.createCdata(
      this.trackingBuilder.createImpressionUrl(id),
    );

    return this;
  }

  /**
   * 비디오 미디어 파일을 추가합니다.
   * @param {Object} mediaFile - 미디어 파일 정보
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  addMediaFile(mediaFile) {
    const mediaFiles = this.template.VAST.Ad.InLine.Creatives.Creative.Linear.MediaFiles;
    mediaFiles.MediaFile.push(VastTemplates.createMediaFile(mediaFile));
    return this;
  }

  /**
   * 비디오 재생 시간을 설정합니다.
   * @param {string} duration - HH:MM:SS 형식의 재생 시간
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  setDuration(duration) {
    this.template.VAST.Ad.InLine.Creatives.Creative.Linear.Duration = duration;
    return this;
  }

  /**
   * 클릭 관련 URL을 설정합니다.
   * @param {Object} params - 클릭 URL 정보
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  setClickUrls({
    clickThrough,
    clickTracking = [],
  }) {
    const videoClicks = this.template.VAST.Ad.InLine.Creatives.Creative.Linear.VideoClicks;

    if (clickThrough) {
      videoClicks.ClickThrough = XmlUtils.createCdata(clickThrough);
    }

    clickTracking.forEach((url) => {
      videoClicks.ClickTracking.push(XmlUtils.createCdata(url));
    });

    return this;
  }

  /**
   * 트래킹 이벤트를 추가합니다.
   * @param {string} event - 이벤트 타입
   * @param {string} url - 트래킹 URL
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  addTrackingEvent(event, url) {
    const trackingEvents = this.template.VAST.Ad.InLine.Creatives.Creative.Linear.TrackingEvents;
    trackingEvents.Tracking.push(VastTemplates.createTrackingEvent(event, url));
    return this;
  }

  /**
   * 기본 트래킹 이벤트들을 추가합니다.
   * @param {string} adId - 광고 ID
   * @return {VastBuilder} 체이닝을 위한 this 반환
   */
  addDefaultTracking(adId) {
    const events = [
      TrackingEventTypes.START,
      TrackingEventTypes.FIRST_QUARTILE,
      TrackingEventTypes.MIDPOINT,
      TrackingEventTypes.THIRD_QUARTILE,
      TrackingEventTypes.COMPLETE,
    ];

    events.forEach((event) => {
      this.addTrackingEvent(
        event,
        this.trackingBuilder.createVideoEventUrl(event, adId),
      );
    });

    return this;
  }

  /**
   * VAST XML 문자열을 생성합니다.
   * @return {string} VAST XML 문자열
   */
  build() {
    return XmlUtils.createXml(this.template);
  }
}

module.exports = VastBuilder;
