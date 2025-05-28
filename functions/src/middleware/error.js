const { logger } = require('firebase-functions/logger');
const { AdServerError, ErrorTypes } = require('../requestAds/errors');

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      type: err.type,
    },
    request: {
      method: req.method,
      url: req.url,
      query: req.query,
      headers: req.headers,
    },
  });

  if (err instanceof AdServerError) {
    return res.status(err.statusCode).json({
      error: {
        type: err.type,
        message: err.message,
      },
    });
  }

  // Zod validation 에러 처리
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        type: ErrorTypes.INVALID_REQUEST.type,
        message: '입력값 검증에 실패했습니다.',
        details: err.errors,
      },
    });
  }

  // 기타 예상치 못한 에러
  return res.status(500).json({
    error: {
      type: ErrorTypes.INTERNAL_ERROR.type,
      message: ErrorTypes.INTERNAL_ERROR.message,
    },
  });
};

module.exports = {
  errorHandler,
};
