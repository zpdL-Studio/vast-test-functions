const { create } = require('xmlbuilder2');

/**
 * XML 관련 유틸리티 클래스
 */
class XmlUtils {
  /**
   * CDATA로 감싸진 텍스트를 생성합니다.
   * @param {string} text - CDATA로 감쌀 텍스트
   * @return {string} CDATA 섹션
   */
  static createCdata(text) {
    return { '#cdata': text };
  }

  /**
   * 특수 문자가 포함된 텍스트를 안전하게 처리합니다.
   * @param {string} text - 처리할 텍스트
   * @return {string} 이스케이프된 텍스트
   */
  static escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * XML 문자열을 생성합니다.
   * @param {Object} obj - XML로 변환할 객체
   * @param {Object} options - XML 생성 옵션
   * @return {string} XML 문자열
   */
  static createXml(obj, options = {}) {
    const defaultOptions = {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: true,
    };

    const doc = create(obj, { ...defaultOptions, ...options });
    return doc.end({ prettyPrint: true });
  }

  /**
   * URL을 CDATA로 감싸서 반환합니다.
   * @param {string} url - 변환할 URL
   * @return {Object} CDATA로 감싸진 URL 객체
   */
  static wrapUrlWithCdata(url) {
    return this.createCdata(url);
  }
}

module.exports = XmlUtils;
