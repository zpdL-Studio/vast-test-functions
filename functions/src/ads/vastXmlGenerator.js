const { create } = require('xmlbuilder2');

/**
 * VAST 4.1 XML을 생성합니다.
 * @param {string} [adId='test-ad-1'] - 광고 ID
 * @param {string} [clickThroughUrl=''] - 광고 클릭시 이동할 URL
 * @param {string} [trackingUrl=''] - 이벤트 트래킹 기본 URL
 * @return {string} VAST XML 문자열
 */
const generateBasicVastXml = (adId = 'test-ad-1', clickThroughUrl = '', trackingUrl = '') => {
  const vast = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('VAST', { version: '4.1' })
    .ele('Ad', { id: adId })
    .ele('InLine')
    .ele('AdSystem', { version: '1.0' })
    .txt('Test Ad Server')
    .up()
    .ele('AdTitle')
    .txt('Test Video Ad')
    .up()
    .ele('Description')
    .dat('A test video ad')
    .up()
    .ele('Advertiser')
    .txt('Test Advertiser')
    .up()
    .ele('Pricing', { model: 'CPM', currency: 'USD' })
    .txt('0.0')
    .up()
    .ele('Error')
    .dat(trackingUrl ? `${trackingUrl}?event=error[ERRORCODE]&adId=${adId}` : '')
    .up();

  // Impression 트래킹
  if (trackingUrl) {
    const impressionUrl = new URL(trackingUrl);
    impressionUrl.searchParams.set('event', 'impression');
    impressionUrl.searchParams.set('adId', adId);

    vast.ele('Impression', { id: 'impression-1' })
      .dat(impressionUrl.toString())
      .up();
  }

  // Creatives 요소 생성
  const creatives = vast.ele('Creatives');
  const creative = creatives
    .ele('Creative', { id: `creative-${adId}`, sequence: '1' })
    .ele('Linear')
    .ele('Duration')
    .txt('00:01:00')
    .up();

  // UniversalAdId 추가 (VAST 4.0의 새로운 필수 요소)
  creative.ele('UniversalAdId', { idRegistry: 'motovvideo', idValue: 'unknown' })
    .txt(adId)
    .up();

  // 트래킹 이벤트 처리
  if (trackingUrl) {
    const trackingEvents = [
      { event: 'start', offset: '00:00:00' },
      { event: 'firstQuartile', offset: '00:00:15' },
      { event: 'midpoint', offset: '00:00:30' },
      { event: 'thirdQuartile', offset: '00:00:45' },
      { event: 'complete', offset: '00:01:00' },
      { event: 'progress', offset: '00:00:05' },
      { event: 'mute' },
      { event: 'unmute' },
      { event: 'pause' },
      { event: 'resume' },
      { event: 'fullscreen' },
      { event: 'exitFullscreen' },
      { event: 'skip' },
    ];

    const trackingElement = creative.ele('TrackingEvents');

    trackingEvents.forEach(({ event, offset }) => {
      const url = new URL(trackingUrl);
      url.searchParams.set('event', event);
      url.searchParams.set('adId', adId);

      const tracking = trackingElement.ele('Tracking', { event });
      if (offset) {
        tracking.att('offset', offset);
      }
      tracking.dat(url.toString()).up();
    });

    trackingElement.up();

    // VideoClicks 추가 (clickThroughUrl이 있는 경우에만)
    if (clickThroughUrl) {
      const videoClicks = creative.ele('VideoClicks');

      // ClickThrough
      videoClicks.ele('ClickThrough', { id: 'click-1' })
        .dat(clickThroughUrl)
        .up();

      // ClickTracking (트래킹 URL이 있는 경우에만)
      if (trackingUrl) {
        const clickTrackingUrl = new URL(trackingUrl);
        clickTrackingUrl.searchParams.set('event', 'click');
        clickTrackingUrl.searchParams.set('adId', adId);
        videoClicks.ele('ClickTracking', { id: 'clickTracking-1' })
          .dat(clickTrackingUrl.toString())
          .up();
      }

      videoClicks.up();
    }
  }

  // MediaFiles 추가 (VAST 4.0에서는 mimes 속성이 필수)
  const mediaFiles = creative.ele('MediaFiles');
  mediaFiles.ele('MediaFile', {
    id: 'video-1',
    delivery: 'progressive',
    type: 'video/webm',
    bitrate: '454',
    width: '1920',
    height: '540',
    scalable: 'true',
    maintainAspectRatio: 'true',
    codec: 'vp8',
    apiFramework: 'VPAID 2.0',
    mimes: 'video/webm',
  })
    .dat('https://firebasestorage.googleapis.com/v0/b/vast-test-697cc.firebasestorage.app/o/sample_ads_webm%2F31047666.webm?alt=media&token=6e7a26a4-cf3c-4d1a-8943-c9a42f399538')
    .up();
  mediaFiles.ele('MediaFile', {
    id: 'video-1',
    delivery: 'progressive',
    type: 'video/mp4',
    bitrate: '96',
    width: '1280',
    height: '360',
    scalable: 'true',
    maintainAspectRatio: 'true',
    codec: 'vp8',
    apiFramework: 'VPAID 2.0',
    mimes: 'video/mp4',
  })
    .dat('https://firebasestorage.googleapis.com/v0/b/vast-test-697cc.firebasestorage.app/o/sample_ads_webm%2F821294609%20(video-converter.com).mp4?alt=media&token=fc673ede-a04e-4fe0-bc27-0285b94361e9')
    .up();
  // InteractiveCreativeFile 추가 (VAST 4.0의 새로운 기능)
  mediaFiles.ele('InteractiveCreativeFile', {
    type: 'application/javascript',
    apiFramework: 'VPAID',
  })
    .dat('')
    .up();

  mediaFiles.up();

  // 최종 XML 생성
  return vast.end({ prettyPrint: true });
};

module.exports = {
  generateBasicVastXml,
};
