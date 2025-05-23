/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const {recordImpression} = require('./src/impressions');

exports.getVastSample = onRequest({
  cors: true,
  region: 'asia-northeast3',
}, (request, response) => {
  logger.info('VAST sample requested', {structuredData: true});

  const vastXML = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="2.0">
  <Ad id="12345">
    <InLine>
      <AdSystem>MOTOVTEST</AdSystem>
      <AdTitle>My VAST Ad</AdTitle>
      <Impression><![CDATA[https://recordimpression-tmavhrqzgq-du.a.run.app]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:10</Duration>
            <MediaFiles>
              <MediaFile id="MOTOVTEST" delivery="progressive" width="640" height="360" type="video/mp4" bitrate="147" scalable="true" maintainAspectRatio="true">
              <![CDATA[ https://redirector.gvt1.com/videoplayback/id/e03cfa4e6f65da6b/itag/18/source/dclk_video_ads/acao/yes/cpn/77BNTLkybJuB0Gw8/ctier/L/ei/OHotaOrvK-SP1d8Ptb3nqAg/ip/0.0.0.0/requiressl/yes/rqh/1/susc/dvc/xpc/Eghovf3BOnoBAQ%3D%3D/expire/1779346872/sparams/expire,ei,ip,requiressl,acao,ctier,source,id,itag,rqh,susc,xpc/sig/AJfQdSswRgIhAImARLCwFSYKsjBoA-nwZf6M3FYnzwEWJK1aiiRDVwB3AiEA-8z-4t7YREQQOGFkUAHuvnW-iLNzRpCWS0ijCHgDV5E%3D/file/file.mp4 ]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

  response.set('Content-Type', 'application/xml');
  response.send(vastXML);
});

exports.recordImpression = recordImpression;
