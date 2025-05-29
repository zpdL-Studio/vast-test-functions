const { onRequest } = require('firebase-functions/v2/https');
const { generateBasicVastXml } = require('./vastXmlGenerator');
const { logger } = require('firebase-functions');
const { isEmulator, getCurrentUrlFromRequest, getFunctionUrl } = require('../util/firebase_environment');

const adsEventsUrl = isEmulator() ? 'http://127.0.0.1:5001/vast-test-697cc/asia-northeast3/ads-events' : process.env.EVENT_URL;


/**
 * VAST XML을 반환하는 HTTP 엔드포인트
 */
exports.requestVast = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, async (req, res) => {
  logger.info('VAST 요청 받음:', req.query);
  try {
    const vastXml = generateBasicVastXml(adsEventsUrl);

    res.set('Content-Type', 'application/xml');
    res.status(200).send(vastXml);
  } catch (error) {
    logger.error('VAST 생성 중 오류 발생:', error);
    res.status(500).send('VAST 생성 중 오류가 발생했습니다.');
  }
});

