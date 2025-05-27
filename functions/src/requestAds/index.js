const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const { createVastXml } = require('./vastBuilder');

/**
 * VAST 3.0 광고 요청을 처리하는 Cloud Function
 */
exports.requestAds = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, async (request, response) => {
  try {
    // POST 메소드 확인
    if (request.method !== 'GET') {
      response.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET method is allowed',
        },
      });
      return;
    }

    logger.info('Ad request received', {
      body: request.body,
      headers: request.headers,
    });

    // VAST XML 생성
    const vastXml = await createVastXml({
      adId: 'sample-ad-123', // 실제 구현시 광고 선택 로직에서 결정
      title: 'Sample Ad',
      duration: '00:00:10',
      mediaUrl: 'https://example.com/sample-ad.mp4',
      trackingUrl: `https://${request.hostname}/trackEvent`,
    });

    // XML 응답 전송
    response.set('Content-Type', 'application/xml');
    response.send(vastXml);
  } catch (error) {
    logger.error('Error processing ad request:', error);
    response.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred while processing the request',
      },
    });
  }
});
