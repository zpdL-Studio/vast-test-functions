/**
 * 광고 서버 커스텀 에러 클래스
 * @extends Error
 */
class AdServerError extends Error {
  /**
   * @param {string} type - 에러 타입
   * @param {string} message - 에러 메시지
   * @param {number} [statusCode=500] - HTTP 상태 코드
   */
  constructor(type, message, statusCode = 500) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.name = 'AdServerError';
  }
}

const ErrorTypes = {
  INVALID_REQUEST: {
    type: 'INVALID_REQUEST',
    statusCode: 400,
    message: '잘못된 요청입니다.',
  },
  UNAUTHORIZED: {
    type: 'UNAUTHORIZED',
    statusCode: 401,
    message: '인증되지 않은 요청입니다.',
  },
  NOT_FOUND: {
    type: 'NOT_FOUND',
    statusCode: 404,
    message: '요청한 리소스를 찾을 수 없습니다.',
  },
  METHOD_NOT_ALLOWED: {
    type: 'METHOD_NOT_ALLOWED',
    statusCode: 405,
    message: '허용되지 않은 HTTP 메서드입니다.',
  },
  INTERNAL_ERROR: {
    type: 'INTERNAL_ERROR',
    statusCode: 500,
    message: '내부 서버 오류가 발생했습니다.',
  },
};

module.exports = {
  AdServerError,
  ErrorTypes,
};
