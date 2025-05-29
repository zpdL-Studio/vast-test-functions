const { create } = require('xmlbuilder2');

/**
 * 기본 VAST 3.0 XML을 생성합니다.
 * @param {string} [trackingUrl=''] - 이벤트 트래킹 기본 URL
 * @return {string} VAST XML 문자열
 */
const generateBasicVastXml = (trackingUrl = '') => {
  const vast = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('VAST', { version: '3.0' })
    .ele('Ad', { id: 'test-ad-1' })
    .ele('InLine')
    .ele('AdSystem')
    .txt('Test Ad Server')
    .up()
    .ele('AdTitle')
    .txt('Test Video Ad')
    .up();

  // Impression 트래킹
  if (trackingUrl) {
    const impressionUrl = new URL(trackingUrl);
    impressionUrl.searchParams.set('event', 'impression');

    vast.ele('Impression')
      .dat(impressionUrl.toString())
      .up();
  }

  vast.ele('Creatives')
    .ele('Creative')
    .ele('Linear')
    .ele('Duration')
    .txt('00:00:30')
    .up()
    .ele('MediaFiles')
    .ele('MediaFile', {
      delivery: 'progressive',
      type: 'video/mp4',
      bitrate: '500',
      width: '400',
      height: '300',
    })
    .dat('http://example.com/video.mp4')
    .up()
    .up();

  // 트래킹 이벤트 처리
  const trackingEvents = [
    'start',
    'firstQuartile',
    'midpoint',
    'thirdQuartile',
    'complete',
  ];

  if (trackingUrl) {
    const trackingElement = vast.ele('TrackingEvents');

    trackingEvents.forEach((event) => {
      const url = new URL(trackingUrl);
      url.searchParams.set('event', event);

      trackingElement
        .ele('Tracking', { event })
        .dat(url.toString())
        .up();
    });

    trackingElement.up();

    // VideoClicks도 같은 URL 사용
    const clickUrl = new URL(trackingUrl);
    clickUrl.searchParams.set('event', 'videoClick');

    vast.ele('VideoClicks')
      .ele('ClickThrough')
      .dat(clickUrl.toString())
      .up()
      .up();
  }

  vast.up().up().up();

  return vast.end({ prettyPrint: true });
};

module.exports = {
  generateBasicVastXml,
};
