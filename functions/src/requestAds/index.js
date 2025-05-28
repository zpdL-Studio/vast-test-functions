const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const { createVastXml } = require('./vastBuilder');
const { getFirestore } = require('firebase-admin/firestore');

// Firestore 인스턴스 초기화
const db = getFirestore();

/**
 * VAST 3.0 광고 요청을 처리하는 Cloud Function
 *
 * @param {Object} request HTTP 요청 객체
 * @param {Object} request.query 쿼리 파라미터
 * @param {string} request.query.appId 애플리케이션 식별자
 * @param {string} request.query.userId (선택) 사용자 식별자
 * @param {string} request.query.adSlotId 광고 슬롯 식별자
 * @param {Object} request.query.deviceInfo (선택) 디바이스 정보
 */
exports.requestAds = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, async (request, response) => {
  try {
    // GET 메소드 확인
    if (request.method !== 'GET') {
      response.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Only GET method is allowed',
        },
      });
      return;
    }

    // 필수 파라미터 검증
    const { appId, adSlotId } = request.query;
    if (!appId || !adSlotId) {
      response.status(400).json({
        error: {
          code: 'INVALID_PARAMETER',
          message: 'Required parameters (appId, adSlotId) are missing',
        },
      });
      return;
    }

    logger.info('Ad request received', {
      query: request.query,
      headers: request.headers,
    });

    // 1. Ad ID 생성 (Firestore 문서 ID 사용)
    const adRequestRef = db.collection('ad_requests').doc();
    const adId = adRequestRef.id;

    // 2. VAST XML 생성
    const vastXml = createVastXml({
      adId,
      title: 'Sample Ad', // TODO: 실제 광고 정보로 대체 필요
      duration: '00:00:10',
      mediaUrl: 'https://example.com/sample-ad.mp4',
      trackingUrl: `https://${request.hostname}/trackEvent`,
    });

    // 3. XML 응답 전송 및 요청 정보 저장
    response.set('Content-Type', 'application/xml');
    response.send(vastXml);

    // Firestore에 요청 정보 저장
    await adRequestRef.set({
      // blueprint.md의 vast_events 컬렉션 스키마 기반
      eventType: 'request',
      adId,
      appId,
      adSlotId,
      userId: request.query.userId || null,
      timestamp: new Date(),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      deviceInfo: request.query.deviceInfo || null,
      vastVersion: '3.0',
      playerInfo: {
        name: request.headers['x-player-name'] || 'unknown',
        version: request.headers['x-player-version'] || 'unknown',
      },
      vastXml,
    });
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
