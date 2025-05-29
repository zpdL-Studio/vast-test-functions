const { logger } = require('firebase-functions');

/**
 * Firebase Emulator 실행 여부를 확인합니다.
 * @return {boolean} Emulator 실행 여부
 */
const isEmulator = () => {
  return process.env.FUNCTIONS_EMULATOR === 'true';
};

/**
 * 현재 실행 환경을 반환합니다.
 * @return {'emulator' | 'production'} 현재 실행 환경
 */
const getEnvironment = () => {
  return isEmulator() ? 'emulator' : 'production';
};

/**
 * HTTP 요청에서 전체 URL을 추출합니다.
 * Express.js 스타일의 요청 객체가 필요합니다.
 *
 * @param {object} req - HTTP 요청 객체
 * @param {string} req.protocol - 프로토콜 (http/https)
 * @param {Function} req.get - 헤더 값을 가져오는 함수
 * @param {string} req.originalUrl - 요청 경로와 쿼리스트링
 * @return {string} 전체 URL 또는 오류 시 빈 문자열
 */
const getCurrentUrlFromRequest = (req) => {
  // 요청 객체 및 필수 속성 유효성 검사
  if (!req || typeof req.get !== 'function' ||
      typeof req.protocol !== 'string' ||
      typeof req.originalUrl !== 'string') {
    logger.error(
      '[getCurrentUrlFromRequest] 유효하지 않은 요청 객체입니다.',
    );
    return '';
  }

  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const originalUrlPath = req.originalUrl;

    // 디버그 로깅
    logger.info(`[URL] Protocol: ${protocol}`);
    logger.info(`[URL] Host: ${host}`);
    logger.info(`[URL] Path: ${originalUrlPath}`);

    const fullUrl = `${protocol}://${host}${originalUrlPath}`;
    logger.info(`[URL] Full: ${fullUrl}`);

    return fullUrl;
  } catch (error) {
    logger.error('[getCurrentUrlFromRequest] URL 생성 실패:', error);
    return '';
  }
};

/**
 * 현재 요청의 host를 기반으로 다른 Firebase Function의 URL을 생성합니다.
 *
 * @param {object} req - HTTP 요청 객체
 * @param {string} functionName - 호출할 function 이름 (예: 'requestVast')
 * @param {string} [path=''] - function 뒤에 추가할 경로
 * @param {Object} [params={}] - URL 쿼리 파라미터
 * @return {string} 생성된 function URL 또는 오류 시 빈 문자열
 */
const getFunctionUrl = (req, functionName, path = '', params = {}) => {
  logger.info('[getFunctionUrl] 시작', {
    functionName,
    path,
    params,
  });

  try {
    // 1. 입력값 검증
    if (!req || !req.get || !functionName) {
      logger.error('[getFunctionUrl] 유효하지 않은 파라미터', {
        hasReq: !!req,
        hasGetMethod: !!(req && req.get),
        functionName,
      });
      return '';
    }

    // 2. 기본 정보 추출
    const host = req.get('host');
    const protocol = req.protocol;
    const isEmulatorEnv = isEmulator();

    logger.info('[getFunctionUrl] 기본 정보', {
      host,
      protocol,
      environment: getEnvironment(),
      isEmulator: isEmulatorEnv,
    });

    // 3. 프로젝트 ID와 리전 설정
    const projectId = process.env.GCLOUD_PROJECT || 'vast-test-697cc';
    const region = process.env.FUNCTION_REGION || 'asia-northeast3';

    logger.info('[getFunctionUrl] 프로젝트 정보', {
      projectId,
      region,
    });

    // 4. 쿼리 파라미터 처리
    const searchParams = new URLSearchParams(params).toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    logger.info('[getFunctionUrl] 쿼리 파라미터 처리', {
      originalParams: params,
      searchParams,
      queryString,
    });

    // 5. 경로 정규화
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    logger.info('[getFunctionUrl] 경로 정규화', {
      originalPath: path,
      normalizedPath,
    });

    // 6. 최종 URL 생성
    let functionUrl;
    if (isEmulatorEnv) {
      // 에뮬레이터 환경: http://127.0.0.1:5001/{projectId}/{region}/{functionName}
      functionUrl = `${protocol}://${host}/${projectId}/${region}/${functionName}${normalizedPath}${queryString}`;
    } else {
      // 프로덕션 환경: https://{region}-{projectId}.cloudfunctions.net/{functionName}
      functionUrl = `${protocol}://${host}/${functionName}${normalizedPath}${queryString}`;
    }

    logger.info('[getFunctionUrl] URL 생성 완료', {
      protocol,
      host,
      projectId,
      region,
      functionName,
      normalizedPath,
      queryString,
      isEmulator: isEmulatorEnv,
      finalUrl: functionUrl,
    });

    return functionUrl;
  } catch (error) {
    logger.error('[getFunctionUrl] URL 생성 중 오류 발생', {
      error: error.message,
      stack: error.stack,
      functionName,
      path,
      params,
    });
    return '';
  }
};

module.exports = {
  isEmulator,
  getEnvironment,
  getCurrentUrlFromRequest,
  getFunctionUrl,
};
