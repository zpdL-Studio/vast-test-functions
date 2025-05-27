const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (if not already initialized elsewhere)
// It's generally recommended to initialize admin only once in your index.js
// However, for a self-contained example within a module,
// you might initialize it here, guarded against re-initialization.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.recordImpression = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, async (request, response) => {
  logger.info('Impression request received', { method: request.method, url: request.url });

  try {
    // Impression 데이터 추출
    const impressionData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // 서버 타임스탬프
      ipAddress: request.ip,
      userAgent: request.get('User-Agent'),
      referer: request.get('Referer'),
      method: request.method,
      url: request.url,
      queryParameters: request.query, // 모든 쿼리 파라미터 저장
      headers: { // 주요 요청 헤더들 저장 (필요에 따라 추가/삭제 가능)
        'accept': request.get('Accept'),
        'host': request.get('Host'),
        'user-agent': request.get('User-Agent'), // User-Agent는 별도로도 저장
        'referer': request.get('Referer'), // Referer도 별도로 저장
        // 필요하다면 다른 헤더를 여기에 추가합니다.
      },
    };

    // Firestore에 저장
    // eslint-disable-next-line max-len
    const docRef = await db.collection('impressions').add(impressionData);
    logger.info(`Impression recorded with ID: ${docRef.id}`, { structuredData: true });

    // 성공 응답
    response.status(200).send('Impression recorded successfully');
  } catch (error) {
    logger.error('Error recording impression:', error, { structuredData: true });
    // 에러 응답
    response.status(500).send('Error recording impression');
  }
});
