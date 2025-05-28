const { z } = require('zod');

// VAST 광고 요청을 위한 기본 스키마
const requestAdsSchema = z.object({
  // 필수 파라미터
  appId: z.string().min(1, '애플리케이션 ID는 필수입니다'),
  adSlotId: z.string().min(1, '광고 슬롯 ID는 필수입니다'),

  // 선택적 파라미터
  userId: z.string().optional(),
  deviceInfo: z.object({
    type: z.enum(['mobile', 'tablet', 'desktop', 'connected-tv']),
    os: z.string().optional(),
    browser: z.string().optional(),
  }).optional(),
});

module.exports = {
  requestAdsSchema,
};
