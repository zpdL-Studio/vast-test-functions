const { onRequest } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase Admin 초기화
initializeApp();
const db = getFirestore();

/**
 * VAST 이벤트 데이터를 Firestore에 저장합니다.
 *
 * @param {string} event - 이벤트 타입 (impression, start, firstQuartile 등)
 * @param {object} data - 저장할 이벤트 데이터
 * @return {Promise<FirebaseFirestore.DocumentReference>}
 */
const saveEventToFirestore = async (event, data) => {
  try {
    const eventRef = db.collection('ads_events').doc();
    const timestamp = new Date();

    const eventData = {
      'event': event,
      ...data,
      'createdAt': timestamp,
    };
    logger.info(`이벤트 저장 성공 [${JSON.stringify(eventData)}]:`);
    await eventRef.set(eventData);
    logger.info(`이벤트 저장 성공 [${event}]:`, eventRef.id);
    return eventRef;
  } catch (error) {
    logger.error('이벤트 저장 실패:', error);
    throw error;
  }
};

exports.events = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, async (req, res) => {
  try {
    const { event } = req.query;

    if (!event) {
      logger.error('이벤트 파라미터 누락');
      return res.status(400).json({
        error: '이벤트 타입이 지정되지 않았습니다.',
      });
    }

    // 이벤트 데이터 구성
    const eventData = {
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || '',
      referer: req.headers['referer'] || '',
      ...req.query,
    };

    // Firestore에 이벤트 저장
    const eventRef = await saveEventToFirestore(event, eventData);

    // 투명 픽셀 이미지 반환 (이미지 비콘 방식 지원)
    if (req.headers.accept?.includes('image/')) {
      res.set('Content-Type', 'image/gif');
      res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
    } else {
      res.status(200).json({
        success: true,
        eventId: eventRef.id,
      });
    }
  } catch (error) {
    logger.error('이벤트 처리 중 오류 발생:', error);
    res.status(500).json({
      error: '이벤트 처리 중 오류가 발생했습니다.',
    });
  }
});

