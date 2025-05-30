const { onRequest } = require('firebase-functions/v2/https');
const { generateBasicVastXml } = require('./vastXmlGenerator');
const { logger } = require('firebase-functions');
const { isEmulator } = require('../util/firebase_environment');

const adsEventsUrl = isEmulator() ? 'http://127.0.0.1:5001/vast-test-697cc/asia-northeast3/adsTranking-events' : 'https://adstranking-events-tmavhrqzgq-du.a.run.app';

/**
 * VAST XML을 반환하는 HTTP 엔드포인트
 */
exports.requestVast = onRequest({
  cors: true,
  // cors: {
  //   origin: 'https://imasdk.googleapis.com',
  //   methods: ['GET', 'OPTIONS'],
  //   credentials: true,
  //   allowedHeaders: ['Content-Type'],
  // },
  region: 'asia-northeast3',
}, async (req, res) => {
  logger.info('VAST 요청 받음:', req.query);
  try {
    const vastXml = generateBasicVastXml(adsEventsUrl, 'test-ad-1');
    // CORS 헤더 설정
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Origin', 'https://imasdk.googleapis.com');
    res.set('Content-Type', 'application/xml');
    res.status(200).send(vastXml);
  } catch (error) {
    logger.error('VAST 생성 중 오류 발생:', error);
    res.status(500).send('VAST 생성 중 오류가 발생했습니다.');
  }
});

