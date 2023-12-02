import pkg from 'request';
import { createHmac } from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const { post } = pkg;

const config = {
  agentId: process.env.AGENT_ID,
  channelSecret: process.env.CHANNEL_SECRET
}

function postToDialogflow(req) {
  req.headers.host = "dialogflow.cloud.google.com";
  return post({
    uri: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${config.agentId}`,
    headers: req.headers,
    body: JSON.stringify(req.body)
  });
};

function convertToDialogflow(req, body) {
  const jsonBody = JSON.stringify(body);
  req.headers.host = "dialogflow.cloud.google.com";
  req.headers["x-line-signature"] = calculateLineSignature(jsonBody);
  req.headers["content-length"] = jsonBody.length;
  return post({
    uri: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${config.agentId}`,
    headers: req.headers,
    body: jsonBody
  });
};

function calculateLineSignature(body) {
  const signature = createHmac('SHA256', config.channelSecret)
    .update(body).digest('base64');
  return signature;
}

function createLineTextEvent(originalRequest, originalEvent, text) {
  return {
    events:
      [{
        type: 'message',
        replyToken: originalEvent.replyToken,
        source: originalEvent.source,
        timestamp: originalEvent.timestamp,
        mode: originalEvent.mode,
        message: {
          type: 'text',
          text,
        },
      }],
    destination: originalRequest.body.destination,
  };
}

export {
  postToDialogflow,
  convertToDialogflow,
  createLineTextEvent,
}