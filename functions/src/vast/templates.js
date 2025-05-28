/**
 * VAST 3.0 기본 템플릿 정의
 */
const VastTemplates = {
  /**
   * 기본 VAST 구조를 반환합니다.
   * @return {Object} VAST 기본 구조 객체
   */
  getBaseTemplate() {
    return {
      'VAST': {
        '@version': '3.0',
        'Ad': {
          '@id': '',
          'InLine': {
            'AdSystem': '',
            'AdTitle': '',
            'Description': '',
            'Impression': '',
            'Creatives': {
              'Creative': {
                'Linear': {
                  'Duration': '',
                  'MediaFiles': {
                    'MediaFile': [],
                  },
                  'VideoClicks': {
                    'ClickThrough': '',
                    'ClickTracking': [],
                  },
                  'TrackingEvents': {
                    'Tracking': [],
                  },
                },
              },
            },
          },
        },
      },
    };
  },

  /**
   * 미디어 파일 객체를 생성합니다.
   * @param {Object} params - 미디어 파일 파라미터
   * @return {Object} 미디어 파일 객체
   */
  createMediaFile({
    url,
    delivery = 'progressive',
    type = 'video/mp4',
    width = 640,
    height = 360,
    bitrate = 500,
    scalable = true,
    maintainAspectRatio = true,
  }) {
    return {
      '@delivery': delivery,
      '@type': type,
      '@width': width,
      '@height': height,
      '@bitrate': bitrate,
      '@scalable': scalable,
      '@maintainAspectRatio': maintainAspectRatio,
      '#cdata': url,
    };
  },

  /**
   * 트래킹 이벤트 객체를 생성합니다.
   * @param {string} event - 이벤트 타입
   * @param {string} url - 트래킹 URL
   * @return {Object} 트래킹 이벤트 객체
   */
  createTrackingEvent(event, url) {
    return {
      '@event': event,
      '#cdata': url,
    };
  },
};

module.exports = VastTemplates;
