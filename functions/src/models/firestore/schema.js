/**
 * @typedef {Object} MediaFile
 * @property {string} url - 미디어 파일 URL
 * @property {number} bitrate - 비트레이트
 * @property {number} width - 너비
 * @property {number} height - 높이
 * @property {string} type - 미디어 타입 (video/mp4 등)
 */

/**
 * @typedef {Object} AdTargeting
 * @property {string[]} countries - 타겟 국가 목록
 * @property {string[]} devices - 타겟 디바이스 목록
 * @property {string[]} languages - 타겟 언어 목록
 */

/**
 * @typedef {Object} AdSettings
 * @property {Date} startDate - 광고 시작일
 * @property {Date} endDate - 광고 종료일
 * @property {number} impressionGoal - 목표 노출 수
 * @property {number} dailyBudget - 일일 예산
 * @property {AdTargeting} targeting - 타겟팅 설정
 */

/**
 * @typedef {Object} AdStats
 * @property {number} impressions - 총 노출 수
 * @property {number} clicks - 총 클릭 수
 * @property {number} completions - 총 완료 수
 */

/**
 * @typedef {Object} Ad
 * @property {string} id - 광고 고유 ID
 * @property {string} title - 광고 제목
 * @property {string} advertiser - 광고주 정보
 * @property {Date} createdAt - 생성 시간
 * @property {Date} updatedAt - 수정 시간
 * @property {'active' | 'inactive' | 'deleted'} status - 광고 상태
 * @property {MediaFile[]} mediaFiles - 미디어 파일 목록
 * @property {AdSettings} settings - 광고 설정
 * @property {AdStats} stats - 통계 정보
 */

/**
 * @typedef {Object} AdRequestParams
 * @property {number} width - 요청된 광고 너비
 * @property {number} height - 요청된 광고 높이
 * @property {string} language - 언어 설정
 * @property {string} country - 국가 정보
 * @property {string} device - 디바이스 정보
 */

/**
 * @typedef {Object} AdRequestResponse
 * @property {string} adId - 제공된 광고 ID
 * @property {number} status - 응답 상태 코드
 * @property {number} responseTime - 응답 처리 시간 (ms)
 */

/**
 * @typedef {Object} AdRequest
 * @property {string} id - 요청 고유 ID
 * @property {Date} timestamp - 요청 시간
 * @property {string} ip - 요청 IP
 * @property {string} userAgent - User Agent
 * @property {AdRequestParams} params - 요청 파라미터
 * @property {AdRequestResponse} response - 응답 정보
 */

/**
 * @typedef {Object} AdEventDetails
 * @property {number} [duration] - 재생 시간 (비디오 이벤트의 경우)
 * @property {number} [position] - 재생 위치
 * @property {number} [volume] - 볼륨 레벨
 * @property {boolean} [fullscreen] - 전체화면 여부
 */

/**
 * @typedef {Object} AdEvent
 * @property {string} id - 이벤트 고유 ID
 * @property {string} adId - 광고 ID
 * @property {string} requestId - 요청 ID
 * @property {Date} timestamp - 이벤트 발생 시간
 * @property {'impression' | 'click' | 'start' | 'firstQuartile' |
 *            'midpoint' | 'thirdQuartile' | 'complete' | 'mute' |
 *            'unmute' | 'pause' | 'resume' | 'fullscreen'} type - 이벤트 타입
 * @property {AdEventDetails} details - 이벤트 상세 정보
 */

/**
 * 광고 상태 상수
 * @enum {string}
 */
const AdStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
};

/**
 * 광고 이벤트 타입 상수
 * @enum {string}
 */
const AdEventType = {
  IMPRESSION: 'impression',
  CLICK: 'click',
  START: 'start',
  FIRST_QUARTILE: 'firstQuartile',
  MIDPOINT: 'midpoint',
  THIRD_QUARTILE: 'thirdQuartile',
  COMPLETE: 'complete',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  PAUSE: 'pause',
  RESUME: 'resume',
  FULLSCREEN: 'fullscreen',
};

module.exports = {
  AdStatus,
  AdEventType,
};
