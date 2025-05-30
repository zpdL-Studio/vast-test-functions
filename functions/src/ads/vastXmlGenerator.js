const { create } = require('xmlbuilder2');

/**
 * 기본 VAST 3.0 XML을 생성합니다.
 * @param {string} [trackingUrl=''] - 이벤트 트래킹 기본 URL
 * @param {string} [adId='test-ad-1'] - 광고 ID
 * @return {string} VAST XML 문자열
 */
const generateBasicVastXml = (trackingUrl = '', adId = 'test-ad-1') => {
  const vast = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('VAST', { version: '3.0' })
    .ele('Ad', { id: adId })
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
    impressionUrl.searchParams.set('adId', adId);

    vast.ele('Impression')
      .dat(impressionUrl.toString())
      .up();
  }

  // Linear 요소 생성
  const linear = vast
    .ele('Creatives')
    .ele('Creative')
    .ele('Linear');

  // Duration 추가
  linear.ele('Duration')
    .txt('00:01:00')
    .up();

  // 트래킹 이벤트 처리
  if (trackingUrl) {
    const trackingEvents = [
      'start',
      'firstQuartile',
      'midpoint',
      'thirdQuartile',
      'complete',
    ];

    const trackingElement = linear.ele('TrackingEvents');

    trackingEvents.forEach((event) => {
      const url = new URL(trackingUrl);
      url.searchParams.set('event', event);
      url.searchParams.set('adId', adId);

      trackingElement
        .ele('Tracking', { event })
        .dat(url.toString())
        .up();
    });

    trackingElement.up();

    // VideoClicks 추가
    const clickUrl = new URL(trackingUrl);
    clickUrl.searchParams.set('event', 'videoClick');
    clickUrl.searchParams.set('adId', adId);

    linear.ele('VideoClicks')
      .ele('ClickThrough')
      .dat(clickUrl.toString())
      .up()
      .up();
  }

  // MediaFiles 추가
  // linear.ele('MediaFiles')
  //   .ele('MediaFile', {
  //     delivery: 'streaming',
  //     type: 'video/webm',
  //     bitrate: '454',
  //     width: '1920',
  //     height: '540',
  //   })
  //   // .dat('https://redirector.gvt1.com/videoplayback/id/e03cfa4e6f65da6b/itag/18/source/dclk_video_ads/acao/yes/cpn/77BNTLkybJuB0Gw8/ctier/L/ei/OHotaOrvK-SP1d8Ptb3nqAg/ip/0.0.0.0/requiressl/yes/rqh/1/susc/dvc/xpc/Eghovf3BOnoBAQ%3D%3D/expire/1779346872/sparams/expire,ei,ip,requiressl,acao,ctier,source,id,itag,rqh,susc,xpc/sig/AJfQdSswRgIhAImARLCwFSYKsjBoA-nwZf6M3FYnzwEWJK1aiiRDVwB3AiEA-8z-4t7YREQQOGFkUAHuvnW-iLNzRpCWS0ijCHgDV5E%3D/file/file.mp4')
  //   .dat('https://firebasestorage.googleapis.com/v0/b/vast-test-697cc.firebasestorage.app/o/sample_ads_webm%2F31047666.webm?alt=media&token=6e7a26a4-cf3c-4d1a-8943-c9a42f399538')
  //   .up()
  //   .up();

  linear.ele('MediaFiles')
    .ele('MediaFile', {
      delivery: 'progressive',
      type: 'video/mp4',
      bitrate: '96',
      width: '1280',
      height: '360',
    })
    .dat('https://firebasestorage.googleapis.com/v0/b/vast-test-697cc.firebasestorage.app/o/sample_ads_webm%2F821294609%20(video-converter.com).mp4?alt=media&token=fc673ede-a04e-4fe0-bc27-0285b94361e9')
    .up()
    .up();
  // 최종 XML 생성
  return vast.end({ prettyPrint: true });
};

module.exports = {
  generateBasicVastXml,
};
