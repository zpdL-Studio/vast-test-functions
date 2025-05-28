# 2단계: 기본 API 구조 설정 계획

## 📌 목표

VAST 광고 요청을 처리하기 위한 기본적인 API 구조를 설정하고, 안정적이고 확장 가능한 기반을 마련합니다.

## 🛠 세부 작업 항목

### 1. 기본 엔드포인트 설정

- [ ] `/requestAds` 엔드포인트 생성
  ```javascript
  exports.requestAds = onRequest(
    {
      region: "asia-northeast3",
      cors: true,
    },
    async (req, res) => {
      // 구현 예정
    }
  );
  ```
- [ ] 기본 라우팅 구조 설정
- [ ] 응답 형식 표준화 (XML/JSON)

### 2. HTTP 메서드 및 요청 처리

- [ ] GET 메서드 구현
  - 쿼리 파라미터 정의
  - 필수 파라미터 검증
  - 파라미터 타입 검증 (Zod 사용)
- [ ] 요청 헤더 처리
  - Content-Type 검증
  - User-Agent 파싱
  - Request IP 처리
- [ ] 응답 헤더 설정
  - XML Content-Type
  - Cache-Control

### 3. 에러 처리 미들웨어

- [ ] 글로벌 에러 핸들러 구현
  - HTTP 상태 코드 매핑
  - 에러 응답 포맷 정의
- [ ] 주요 에러 타입 정의
  ```javascript
  const ErrorTypes = {
    INVALID_REQUEST: "INVALID_REQUEST",
    UNAUTHORIZED: "UNAUTHORIZED",
    NOT_FOUND: "NOT_FOUND",
    INTERNAL_ERROR: "INTERNAL_ERROR",
  };
  ```
- [ ] 에러 로깅 구현
- [ ] 커스텀 에러 클래스 구현

### 4. 기본 로깅 설정

- [ ] Firebase Functions 기본 로거 설정
  - 로그 레벨 정의
  - 구조화된 로깅 포맷 설정
- [ ] 요청/응답 로깅 미들웨어
  - 요청 정보 로깅 (IP, User-Agent, 파라미터)
  - 응답 상태 및 시간 로깅
- [ ] 성능 메트릭 로깅
  - 응답 시간 측정
  - 메모리 사용량 모니터링

## 📝 파일 구조

```
functions/
├── src/
│   ├── requestAds/
│   │   ├── index.js        # 메인 핸들러
│   │   ├── validator.js    # 입력 검증 (Zod 스키마)
│   │   └── errors.js       # 에러 정의
│   ├── middleware/
│   │   ├── error.js        # 에러 처리
│   │   └── logging.js      # 로깅
│   └── utils/
│       ├── logger.js       # 로거 설정
│       └── metrics.js      # 성능 메트릭
```

## ✅ 완료 조건

1. 모든 엔드포인트가 정상적으로 응답
2. 에러 상황에서 적절한 에러 응답 반환
3. 모든 요청/응답이 구조화되어 로깅됨
4. 입력값 검증이 정상적으로 동작
5. 성능 메트릭이 수집됨

## 🔍 테스트 항목

1. 엔드포인트 접근성 테스트
2. HTTP 메서드 검증
3. 파라미터 검증 테스트
4. 에러 처리 테스트
5. 로깅 정상 동작 확인
6. 성능 메트릭 수집 확인

## 📚 참고 사항

- Firebase Functions V2 문서
- VAST 3.0 스펙
- Firebase 로깅 가이드
- Zod 문서
