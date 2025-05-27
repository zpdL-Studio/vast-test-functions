const { create } = require('xmlbuilder2');

/**
 * VAST 3.0 XML을 생성합니다.
 * @param {Object} params - VAST XML 생성에 필요한 파라미터
 * @param {string} params.adId - 광고 ID
 * @param {string} params.title - 광고 제목
 * @param {string} params.duration - 광고 재생 시간 (HH:MM:SS 형식)
 * @param {string} params.mediaUrl - 미디어 파일 URL
 * @param {string} params.trackingUrl - 트래킹 베이스 URL
 * @return {string} 생성된 VAST XML 문자열
 */
exports.createVastXml = ({
  adId,
  title,
  duration,
  mediaUrl,
  trackingUrl,
}) => {
  const vastDoc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('VAST', { version: '3.0' })
    .ele('Ad', { id: adId })
    .ele('InLine')
    .ele('AdSystem').txt('MOTOVTEST').up()
    .ele('AdTitle').txt(title).up()
    .ele('Impression')
    .dat(`${trackingUrl}?type=impression&adId=${adId}`).up()
    .ele('Creatives')
    .ele('Creative')
    .ele('Linear')
    .ele('Duration').txt(duration).up()
    .ele('MediaFiles')
    .ele('MediaFile', {
      delivery: 'progressive',
      type: 'video/mp4',
      width: '1920',
      height: '1080',
    })
    .dat(mediaUrl).up()
    .up()
    .ele('TrackingEvents')
    .ele('Tracking', { event: 'start' })
    .dat(`${trackingUrl}?type=start&adId=${adId}`).up()
    .ele('Tracking', { event: 'firstQuartile' })
    .dat(`${trackingUrl}?type=firstQuartile&adId=${adId}`).up()
    .ele('Tracking', { event: 'midpoint' })
    .dat(`${trackingUrl}?type=midpoint&adId=${adId}`).up()
    .ele('Tracking', { event: 'thirdQuartile' })
    .dat(`${trackingUrl}?type=thirdQuartile&adId=${adId}`).up()
    .ele('Tracking', { event: 'complete' })
    .dat(`${trackingUrl}?type=complete&adId=${adId}`).up();

  return vastDoc.end({ prettyPrint: true });
};
