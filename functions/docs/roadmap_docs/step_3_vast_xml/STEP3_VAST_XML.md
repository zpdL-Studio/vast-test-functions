# STEP 3: VAST XML 생성 시스템 구현

## 1. 개요

VAST(Video Ad Serving Template) XML을 생성하는 시스템을 구현했습니다. 이 시스템은 광고 데이터를 입력받아 VAST 3.0 표준을 준수하는 XML을 생성합니다.

## 2. 구현 내용

### 2.1 디렉토리 구조

```
src/
├── vast/
│   ├── index.js      # 메인 모듈
│   ├── types.js      # 타입 클래스 정의
│   ├── builder.js    # VAST XML 빌더
│   ├── templates.js  # VAST 템플릿
│   └── tracking.js   # 트래킹 URL 생성
└── utils/
    └── xml.js        # XML 유틸리티
```

### 2.2 주요 클래스 및 모듈

#### 2.2.1 타입 클래스 (types.js)

1. `MediaFile` 클래스

   - 비디오 미디어 파일 정보 관리
   - 속성: URL, 전송 방식, MIME 타입, 크기, 비트레이트 등
   - 기본값 제공 (width: 640, height: 360, bitrate: 500)

2. `TrackingEvents` 클래스

   - 비디오 재생 관련 트래킹 이벤트 관리
   - 지원 이벤트: start, firstQuartile, midpoint, thirdQuartile, complete
   - 모든 이벤트는 선택적으로 설정 가능

3. `AdData` 클래스

   - 광고 데이터 통합 관리
   - 필수 필드: id, title, mediaFiles, duration
   - 유효성 검증 기능 내장

   ```javascript
   const adData = new AdData({
     id: "12345",
     title: "샘플 광고",
     mediaFiles: [
       {
         url: "https://example.com/video.mp4",
       },
     ],
     duration: "00:00:30",
   });
   ```

4. `Config` 클래스
   - VAST 생성 설정 관리
   - trackingBaseUrl 필수 설정
   - URL 유효성 검증

#### 2.2.2 XML 생성 시스템

1. XML 유틸리티 (xml.js)

   - CDATA 섹션 생성
   - 특수 문자 이스케이프 처리
   - XML 문자열 생성

2. VAST 템플릿 (templates.js)

   - VAST 3.0 기본 구조 정의
   - 미디어 파일 템플릿
   - 트래킹 이벤트 템플릿

3. 트래킹 URL 생성기 (tracking.js)

   - 다양한 이벤트별 트래킹 URL 생성
   - URL 파라미터 자동 설정

4. VAST 빌더 (builder.js)
   - 체이닝 방식의 빌더 패턴 구현
   - 단계별 XML 구성

### 2.3 사용 예시

```javascript
const vastXml = createVastXml(
  {
    trackingBaseUrl: "https://tracking.example.com",
  },
  {
    id: "12345",
    title: "샘플 비디오 광고",
    description: "광고 설명",
    mediaFiles: [
      {
        url: "https://example.com/video.mp4",
        width: 1920,
        height: 1080,
        bitrate: 2000,
      },
    ],
    duration: "00:00:30",
    clickThrough: "https://example.com/landing",
    clickTracking: ["https://tracking.example.com/click"],
    trackingEvents: {
      start: "https://tracking.example.com/start",
      complete: "https://tracking.example.com/complete",
    },
  }
);
```

## 3. 주요 특징

1. **타입 안정성**

   - 클래스 기반 타입 시스템
   - JSDoc을 통한 타입 정의
   - IDE 자동 완성 지원

2. **유효성 검증**

   - 필수 필드 검증
   - 데이터 형식 검증
   - URL 유효성 검증

3. **유연성**

   - 빌더 패턴을 통한 유연한 XML 생성
   - 선택적 필드 지원
   - 기본값 제공

4. **재사용성**
   - 모듈화된 구조
   - 독립적인 유틸리티 함수
   - 명확한 책임 분리

## 4. 향후 개선 사항

1. **기능 확장**

   - VAST 4.0 지원
   - 더 많은 트래킹 이벤트 지원
   - 비선형 광고 지원

2. **성능 최적화**

   - XML 생성 성능 개선
   - 메모리 사용량 최적화
   - 캐싱 시스템 도입

3. **테스트 강화**
   - 단위 테스트 추가
   - 통합 테스트 구현
   - 성능 테스트 도입
