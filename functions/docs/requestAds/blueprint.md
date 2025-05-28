# VAST 광고 응답 서비스 설계 (`/requestAds`)

## 1. 개요

VAST 3.0(Video Ad Serving Template) 광고 요청에 대해 동적으로 VAST XML을 생성하여 반환하는 서비스입니다.

## 2. 엔드포인트 상세

### 기본 정보

- **URL:** `/requestAds`
- **Method:** `GET`
- **Content-Type:** `application/xml`

### 응답

#### 성공 응답 (200 OK)

- **Content-Type:** `application/xml`
- **Body:** VAST XML 문자열

예시:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="[광고ID]">
    <InLine>
      <AdSystem>MOTOVTEST</AdSystem>
      <AdTitle>[광고제목]</AdTitle>
      <Impression><![CDATA[https://[도메인]/trackEvent?type=impression&adId=[광고ID]]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://[미디어파일URL]]]>
              </MediaFile>
            </MediaFiles>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[https://[도메인]/trackEvent?type=start&adId=[광고ID]]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[https://[도메인]/trackEvent?type=firstQuartile&adId=[광고ID]]]></Tracking>
              <Tracking event="midpoint"><![CDATA[https://[도메인]/trackEvent?type=midpoint&adId=[광고ID]]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[https://[도메인]/trackEvent?type=thirdQuartile&adId=[광고ID]]]></Tracking>
              <Tracking event="complete"><![CDATA[https://[도메인]/trackEvent?type=complete&adId=[광고ID]]]></Tracking>
            </TrackingEvents>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>
```

#### 실패 응답

- **Content-Type:** `application/json`
- **상태 코드:**
  - 400: 잘못된 요청 (필수 파라미터 누락 등)
  - 404: 적절한 광고를 찾을 수 없음
  - 500: 서버 내부 오류

예시:

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Required parameter 'appId' is missing"
  }
}
```

## 3. 내부 처리 로직

1. **Ad ID 생성**

   - `ad_requests` 컬렉션에서 새로운 문서 아이드를 생성
   - 자동 생성된 문서 ID를 VAST Ad ID로 사용

2. **VAST XML 생성**

   - xmlbuilder2 라이브러리 사용
   - Firestore 문서 ID를 Ad ID로 사용
   - 동적 트래킹 URL 생성
   - 미디어 파일 URL 포함

3. **요청 정보 저장**

   - Firestore의 `ad_requests` 컬렉션에 요청 정보 저장:

   ```javascript
    {
      adId: string,          // 생성된 Ad ID
      ipAddress: string,      // 요청자 IP
      userAgent: string,      // User-Agent
      vastXml: string,        // 생성된 VAST XML
      servedAt: timestamp     // 응답 전송 시간
    }
   ```

4. **응답 전송**
   - Content-Type 헤더 설정
   - VAST XML 반환

## 4. Firestore 데이터 모델

- Sample Code로 대채할거야

<!-- ### `ad_campaigns` 컬렉션

```javascript
{
  campaignId: string,
  name: string,
  startDate: timestamp,
  endDate: timestamp,
  status: string,
  targeting: {
    appIds: string[],
    deviceTypes: string[],
    osTypes: string[],
  },
  creatives: string[]  // 크리에이티브 ID 배열
}
```
### `ad_creatives` 컬렉션

```javascript
{
  creativeId: string,
  type: string,
  title: string,
  duration: number,
  mediaUrl: string,
  clickThroughUrl: string,
  vastTemplate: string
}
``` -->

## 5. 에러 처리

### 주요 에러 케이스

1. 필수 파라미터 누락
2. 유효하지 않은 파라미터 값
3. 적절한 광고를 찾을 수 없음
4. Firestore 조회 실패
5. XML 생성 오류

### 에러 로깅

- Cloud Logging을 통한 상세 에러 정보 기록
- 구조화된 로그 데이터 포함 (요청 정보, 에러 상세 등)

## 6. 성능 최적화

1. **캐싱 전략**

   - 자주 사용되는 VAST 템플릿 메모리 캐싱
   - 광고 캠페인 데이터 캐싱

2. **Firestore 쿼리 최적화**

   - 적절한 인덱스 생성
   - 복합 쿼리 최적화

3. **Cloud Functions 설정**
   - CORS: true
   - 리전 설정 (asia-northeast3)

## 7. 모니터링 및 알림

1. **모니터링 지표**

   - 요청 수
   - 응답 시간
   - 오류율
   - 캠페인별 노출 수

2. **알림 설정**
   - 오류율 임계치 초과 시 알림
   - 응답 시간 임계치 초과 시 알림
   - 인스턴스 수 임계치 도달 시 알림
