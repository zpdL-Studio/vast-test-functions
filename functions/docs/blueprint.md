# Firebase 기반 VAST 광고 서버 구축 계획

## 1. 서론 (Introduction)

### 1.1. 프로젝트 개요 (Project Overview)

본 문서는 Firebase Cloud Functions와 Firestore를 사용하여 VAST(Video Ad Serving Template) 광고 서버를 구축하는 계획을 기술한다. 이 서버는 광고 요청에 대해 동적으로 VAST URL을 생성하여 반환하고, 광고 재생 중 발생하는 다양한 VAST 이벤트를 추적하여 Firestore에 기록하는 기능을 제공하는 것을 목표로 한다.

### 1.2. 목표 (Goals)

- Firebase Cloud Functions를 활용한 확장 가능하고 안정적인 VAST 광고 서버 구축
- 광고 요청 파라미터에 기반한 동적 VAST XML 생성 및 제공 기능 구현
- VAST 표준 이벤트(impression, click, quartiles, complete 등)의 정확한 추적 및 Firestore 저장 기능 구현
- 광고 캠페인 및 크리에이티브 관리를 위한 기본적인 데이터 모델 설계 (선택 사항)

## 2. 시스템 설계 (System Design)

### 2.1. 전체 아키텍처 (Overall Architecture)

본 시스템은 다음과 같은 주요 구성 요소로 이루어진다:

- **클라이언트 (광고 플레이어):**
  - 광고 서버에 VAST URL 요청
  - 수신된 VAST XML을 파싱하여 광고 재생
  - VAST XML 내에 명시된 트래킹 URL로 광고 이벤트 발생 시 알림
- **Firebase Cloud Functions:**
  - HTTP 엔드포인트를 통해 클라이언트 요청 처리
  - VAST URL 생성 로직 수행
  - VAST 이벤트 트래킹 로직 수행
- **Firebase Firestore:**
  - 수집된 VAST 이벤트 데이터 저장
  - 광고 캠페인, 크리에이티브 등 광고 운영에 필요한 메타데이터 저장 (선택 사항)

### 2.2. 핵심 구성 요소 상세 (Core Components Detail)

#### 2.2.1. Firebase Cloud Functions

- **VAST 요청 처리 함수 (`/getVast`):** 광고 요청을 받아 VAST XML을 동적으로 생성하여 반환한다.
- **이벤트 트래킹 함수 (`/trackEvent`):** 광고 플레이어로부터 VAST 이벤트를 수신하여 Firestore에 기록한다.

#### 2.2.2. Firebase Firestore

- **이벤트 데이터 저장소 (`vast_events` 컬렉션):** 광고 노출 및 상호작용 관련 모든 이벤트 로그를 저장한다.
- **광고 메타데이터 저장소 (예: `ad_campaigns`, `ad_creatives` 컬렉션):** 광고 운영에 필요한 캠페인 정보, 광고 소재 정보 등을 관리한다. (선택적 구현)

### 2.3. 주요 기능 상세 (Detailed Key Features)

#### 2.3.1. VAST URL 생성 및 제공

- **입력:** 광고 요청 파라미터 (예: 앱 ID, 사용자 ID, 광고 슬롯 ID, 디바이스 정보 등)
- **처리:**
  1.  입력 파라미터를 기반으로 Firestore 또는 외부 시스템에서 적절한 광고 캠페인 및 크리에이티브 선택
  2.  선택된 광고 정보를 바탕으로 동적으로 VAST XML 생성 (IAB VAST 표준 준수)
  3.  VAST XML 내에 표준 이벤트 트래킹 URL (impression, start, firstQuartile, midpoint, thirdQuartile, complete, clickThrough 등) 삽입
- **출력:** 생성된 VAST XML 문자열 (Content-Type: `application/xml`) 또는 VAST XML을 가리키는 URL

#### 2.3.2. VAST 이벤트 수집 및 처리

- **지원 이벤트:** 표준 VAST 이벤트 (impression, creativeView, start, firstQuartile, midpoint, thirdQuartile, complete, mute, unmute, pause, resume, fullscreen, exitFullscreen, clickThrough, skip 등)
- **처리:**
  1.  광고 플레이어가 VAST XML에 명시된 트래킹 URL로 HTTP GET 또는 POST 요청
  2.  Cloud Function이 요청을 수신하여 관련 정보 (이벤트 종류, 광고 ID, 사용자 정보, 타임스탬프 등) 추출
  3.  추출된 이벤트 데이터를 Firestore의 `vast_events` 컬렉션에 저장

#### 2.3.3. 데이터 영속성 (Data Persistence)

- **저장 대상:**
  - VAST 이벤트 로그: 광고 노출 및 사용자 상호작용의 모든 기록
  - 광고 메타데이터: 캠페인, 크리에이티브 정보 등 (선택 사항)
- **저장소:** Firebase Firestore 사용

## 3. API 명세 (API Specification)

### 3.1. VAST URL 요청 API (`/getVast`)

- **HTTP Method:** `GET`
- **엔드포인트:** `/getVast`
- **요청 파라미터 (Query Parameters):**
  - `appId`: (String, 필수) 애플리케이션 식별자
  - `userId`: (String, 선택) 사용자 식별자
  - `adSlotId`: (String, 필수) 광고 슬롯 식별자
  - `deviceInfo`: (Object, 선택) 디바이스 정보 (OS, 모델 등)
  - 기타 타겟팅 및 광고 선택을 위한 파라미터
- **성공 응답 (200 OK):**
  - `Content-Type: application/xml`
  - Body: VAST XML 문자열
- **실패 응답 (4xx, 5xx):**
  - `Content-Type: application/json`
  - Body: 에러 정보 (JSON 형식)

### 3.2. VAST 이벤트 트래킹 API (`/trackEvent`)

- **HTTP Method:** `GET` 또는 `POST` (GET 요청 시 1x1 투명 픽셀 이미지 반환 권장)
- **엔드포인트:** `/trackEvent`
- **요청 파라미터 (Query Parameters 또는 Request Body):**
  - `eventId`: (String, 필수) VAST XML 생성 시 포함된 고유 이벤트 식별자 또는 서버에서 생성 가능한 정보 조합
  - `eventType`: (String, 필수) VAST 이벤트 타입 (예: "impression", "complete", "clickThrough")
  - `adId`: (String, 필수) 광고 식별자 (캠페인 또는 광고 그룹 ID)
  - `creativeId`: (String, 필수) 크리에이티브(소재) 식별자
  - `timestamp`: (Timestamp, 필수) 이벤트 발생 시간 (클라이언트 또는 서버에서 생성)
  - `userId`: (String, 선택) 사용자 식별자
  - 기타 분석에 필요한 추가 정보
- **성공 응답:**
  - `GET` 요청 시: `200 OK` 또는 `204 No Content` (Content-Type: `image/gif`, 1x1 투명 픽셀)
  - `POST` 요청 시: `200 OK` 또는 `204 No Content` (응답 본문 없음)
- **실패 응답 (4xx, 5xx):**
  - `Content-Type: application/json`
  - Body: 에러 정보 (JSON 형식)

## 4. 데이터베이스 설계 (Database Design)

### 4.1. Firestore 데이터 모델 (Firestore Data Model)

#### 4.1.1. `vast_events` 컬렉션

각 문서는 하나의 VAST 이벤트를 나타냅니다.

- `eventId`: String (Cloud Function에서 생성 또는 VAST XML에 포함된 고유 ID)
- `eventType`: String (예: "impression", "start", "complete", "clickThrough")
- `adId`: String (광고 캠페인 또는 광고 그룹 ID)
- `creativeId`: String (광고 소재 ID)
- `userId`: String (사용자 식별자, 개인정보보호 고려)
- `appId`: String (애플리케이션 식별자)
- `adSlotId`: String (광고 슬롯 식별자)
- `timestamp`: Timestamp (Firestore Timestamp, 이벤트 발생 시각)
- `ipAddress`: String (사용자 IP 주소, 개인정보보호 및 수집 동의 필요)
- `userAgent`: String (사용자 User-Agent, 개인정보보호 및 수집 동의 필요)
- `deviceInfo`: Object (디바이스 관련 정보)
- `vastVersion`: String (사용된 VAST 버전, 예: "3.0", "4.2")
- `playerInfo`: Object (광고 플레이어 정보, 예: 이름, 버전)

#### 4.1.2. `ad_campaigns` 컬렉션 (선택 사항)

광고 캠페인 정보를 관리합니다.

- `campaignId`: String (고유 캠페인 ID)
- `name`: String (캠페인 이름)
- `startDate`: Timestamp
- `endDate`: Timestamp
- `targetingRules`: Object (타겟팅 조건)
- `creatives`: Array of Strings (해당 캠페인에 속한 `creativeId` 목록)

#### 4.1.3. `ad_creatives` 컬렉션 (선택 사항)

광고 크리에이티브(소재) 정보를 관리합니다.

- `creativeId`: String (고유 크리에이티브 ID)
- `type`: String (예: "video", "image")
- `mediaFileUrl`: String (미디어 파일 URL)
- `duration`: Number (초 단위, 비디오 광고의 경우)
- `landingPageUrl`: String (클릭 시 이동할 URL)
- `vastXmlTemplate`: String (이 크리에이티브를 위한 VAST XML 템플릿 조각)

## 6. 구현 단계 (Implementation Steps)

1.  **Firebase 프로젝트 설정:**
    - Firebase 프로젝트 생성
    - Firestore 데이터베이스 활성화
    - Cloud Functions 설정
2.  **개발 환경 설정:**
    - Node.js 및 Firebase CLI 설치
    - 로컬 Firebase 에뮬레이터 설정 (Functions, Firestore)
3.  **Cloud Functions 개발 - VAST URL 생성 (`/getVast`):**
    - VAST XML 생성 로직 구현 (XML 빌더 라이브러리 사용 권장, 예: `xmlbuilder2`)
    - 광고 선택 로직 구현 (Firestore 또는 외부 시스템 연동)
    - 트래킹 URL 동적 생성 및 VAST XML에 삽입
    - 함수 배포 및 테스트
4.  **Cloud Functions 개발 - 이벤트 트래킹 (`/trackEvent`):**
    - 요청 파라미터 수신 및 검증
    - Firestore에 이벤트 데이터 저장 로직 구현
    - 함수 배포 및 테스트
5.  **Firestore 보안 규칙 설정:**
    - Cloud Functions에서만 `vast_events` 컬렉션에 쓰기 가능하도록 설정
    - 필요한 경우 `ad_campaigns`, `ad_creatives` 컬렉션에 대한 접근 규칙 설정
6.  **VAST XML 템플릿 관리:**
    - 다양한 광고 유형 및 이벤트에 대한 VAST XML 템플릿 정의
    - 템플릿을 Firestore에 저장하거나 함수 코드 내에 포함
7.  **테스트:**
    - 단위 테스트 및 통합 테스트 작성
    - 실제 광고 플레이어 또는 VAST 검증 도구를 사용하여 테스트
8.  **배포 및 모니터링:**
    - Cloud Functions 배포
    - Firebase 콘솔을 통한 모니터링 (함수 실행, Firestore 사용량 등)
    - 로깅 설정 (Cloud Logging)

## 7. 고려 사항 (Considerations)

- **확장성 (Scalability):**
  - Cloud Functions와 Firestore는 자동 확장을 지원하지만, Firestore 데이터 구조 및 쿼리 최적화 필요.
  - 대량 트래픽 발생 시 함수 인스턴스 수 및 실행 시간 제한 고려.
- **보안 (Security):**
  - 모든 엔드포인트는 HTTPS 사용.
  - 입력값 검증 철저히 수행 (XSS, SQL Injection 등 방지).
  - Firestore 보안 규칙을 통해 데이터 접근 제어.
  - API Key 또는 인증 메커니즘 도입 고려 (필요시).
- **성능 (Performance):**
  - VAST XML 생성 시간 최적화.
  - Firestore 읽기/쓰기 작업 최적화 (배치 작업, 인덱싱 활용).
  - Cloud Functions 콜드 스타트 최소화 방안 고려 (최소 인스턴스 설정 등).
- **비용 (Cost):**
  - Firebase 서비스 사용량 (Cloud Functions 호출 수, 실행 시간, Firestore 읽기/쓰기/저장 용량, 네트워크 트래픽)에 따른 비용 예측 및 관리.
- **VAST 표준 준수:**
  - IAB VAST 사양 (최신 버전 및 하위 호환성)을 정확히 준수하여 다양한 광고 플레이어와의 호환성 확보.
  - VAST 검증 도구를 사용하여 생성된 VAST XML의 유효성 검사.
- **개인정보보호 (Privacy):**
  - 사용자 데이터 수집 및 사용 시 GDPR, CCPA 등 관련 개인정보보호 규정 준수.
  - IP 주소, 사용자 ID 등 개인 식별 정보 처리에 대한 명확한 정책 및 동의 절차 마련.
- **오류 처리 및 로깅 (Error Handling & Logging):**
  - Cloud Functions 내에서 발생하는 예외 상황에 대한 적절한 오류 처리 로직 구현.
  - Cloud Logging을 활용하여 상세한 로그 기록 (요청, 응답, 오류 등) 및 모니터링.
- **광고 캠페인 관리:**
  - 광고 캠페인, 크리에이티브, 타겟팅 규칙 등을 효율적으로 관리할 수 있는 방안 고려 (Firestore 직접 관리 또는 외부 어드민 툴 연동).
- **테스트 및 검증:**
  - 다양한 환경(디바이스, OS, 플레이어)에서의 광고 노출 및 이벤트 트래킹 테스트.
  - 부하 테스트를 통해 시스템의 안정성 및 성능 한계점 파악.
