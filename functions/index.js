/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { recordImpression } = require("./src/impressions");

exports.getVastSample = onRequest((request, response) => {
  logger.info("VAST sample requested", {structuredData: true});

  const vastXML = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="2.0">
  <Ad id="12345">
    <InLine>
      <AdSystem>My Ad System</AdSystem>
      <AdTitle>My VAST Ad</AdTitle>
      <Impression><![CDATA[http://example.com/impression]]></Impression>
      <Creatives>
        <Creative>
          <Linear>
            <Duration>00:00:30</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="640" height="360">
                <![CDATA[http://example.com/my-ad.mp4]]>
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
