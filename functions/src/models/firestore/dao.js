const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { AdStatus, AdEventType } = require('./schema');

/**
 * Firestore 데이터 접근을 위한 기본 DAO 클래스
 */
class BaseDao {
  /**
   * @param {string} collectionName - 컬렉션 이름
   */
  constructor(collectionName) {
    this.db = getFirestore();
    this.collection = this.db.collection(collectionName);
  }

  /**
   * 문서 생성
   * @param {Object} data - 생성할 문서 데이터
   * @return {Promise<string>} 생성된 문서의 ID
   */
  async create(data) {
    const docRef = await this.collection.add(data);
    return docRef.id;
  }

  /**
   * ID로 문서 조회
   * @param {string} id - 문서 ID
   * @return {Promise<Object|null>} 조회된 문서 데이터
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  /**
   * 문서 업데이트
   * @param {string} id - 문서 ID
   * @param {Object} data - 업데이트할 데이터
   * @return {Promise<void>}
   */
  async update(id, data) {
    await this.collection.doc(id).update(data);
  }

  /**
   * 문서 삭제
   * @param {string} id - 문서 ID
   * @return {Promise<void>}
   */
  async delete(id) {
    await this.collection.doc(id).delete();
  }
}

/**
 * 광고 데이터 접근 클래스
 */
class AdDao extends BaseDao {
  constructor() {
    super('ads');
  }

  /**
   * 활성 상태의 광고 목록 조회
   * @return {Promise<Array>} 활성 광고 목록
   */
  async getActiveAds() {
    const snapshot = await this.collection
      .where('status', '==', AdStatus.ACTIVE)
      .where('settings.endDate', '>', new Date())
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 타겟팅 조건에 맞는 광고 조회
   * @param {string} country - 국가
   * @param {string} device - 디바이스
   * @param {string} language - 언어
   * @return {Promise<Array>} 조건에 맞는 광고 목록
   */
  async getTargetedAds(country, device, language) {
    const snapshot = await this.collection
      .where('status', '==', AdStatus.ACTIVE)
      .where('settings.targeting.countries', 'array-contains', country)
      .where('settings.targeting.devices', 'array-contains', device)
      .where('settings.targeting.languages', 'array-contains', language)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 광고 통계 업데이트
   * @param {string} id - 광고 ID
   * @param {'impression'|'click'|'completion'} type - 통계 타입
   * @return {Promise<void>}
   */
  async updateStats(id, type) {
    const field = `stats.${type}s`; // impressions, clicks, completions
    await this.collection.doc(id).update({
      [field]: FieldValue.increment(1),
    });
  }
}

/**
 * 광고 요청 데이터 접근 클래스
 */
class AdRequestDao extends BaseDao {
  constructor() {
    super('ad_requests');
  }

  /**
   * 특정 기간 동안의 요청 조회
   * @param {Date} startDate - 시작일
   * @param {Date} endDate - 종료일
   * @return {Promise<Array>} 요청 목록
   */
  async getRequestsByDateRange(startDate, endDate) {
    const snapshot = await this.collection
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 특정 광고에 대한 요청 조회
   * @param {string} adId - 광고 ID
   * @return {Promise<Array>} 요청 목록
   */
  async getRequestsByAdId(adId) {
    const snapshot = await this.collection
      .where('response.adId', '==', adId)
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

/**
 * 광고 이벤트 데이터 접근 클래스
 */
class AdEventDao extends BaseDao {
  constructor() {
    super('events');
  }

  /**
   * 특정 광고의 이벤트 조회
   * @param {string} adId - 광고 ID
   * @return {Promise<Array>} 이벤트 목록
   */
  async getEventsByAdId(adId) {
    const snapshot = await this.collection
      .where('adId', '==', adId)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 특정 타입의 이벤트 조회
   * @param {string} type - 이벤트 타입
   * @return {Promise<Array>} 이벤트 목록
   */
  async getEventsByType(type) {
    const snapshot = await this.collection
      .where('type', '==', type)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 특정 기간 동안의 이벤트 조회
   * @param {Date} startDate - 시작일
   * @param {Date} endDate - 종료일
   * @return {Promise<Array>} 이벤트 목록
   */
  async getEventsByDateRange(startDate, endDate) {
    const snapshot = await this.collection
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * 배치 이벤트 생성
   * @param {Array} events - 이벤트 데이터 배열
   * @return {Promise<Array<string>>} 생성된 이벤트 ID 배열
   */
  async createBatch(events) {
    const batch = this.db.batch();
    const refs = [];

    events.forEach((event) => {
      const ref = this.collection.doc();
      refs.push(ref);
      batch.set(ref, event);
    });

    await batch.commit();
    return refs.map((ref) => ref.id);
  }
}

module.exports = {
  AdDao,
  AdRequestDao,
  AdEventDao,
};
