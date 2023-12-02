import express from "express";
import { messagingApi, middleware } from '@line/bot-sdk';
import config from "./middlewareConfig.mjs";
import dotenv from 'dotenv';
import { WebhookClient } from 'dialogflow-fulfillment';
import { postToDialogflow, createLineTextEvent, convertToDialogflow } from './dialogflow.mjs';

dotenv.config();
const PORT = process.env.PORT || 3200;
const client = new messagingApi.MessagingApiClient(config);
const app = express();

// webhook callback
app.post('/webhook', middleware(config), (req, res) => {
  // handle events separately
  Promise.all(req.body.events.map(event => {
    console.log(event.message);
    handleText(req, event);
  }))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

async function testIntent(agent) {
  agent.add(`Comming message -> ${agent.query}`);
  console.log("Detected: Test Intent");
}

async function handleText(req) {
  return postToDialogflow(req);
}

app.use(express.json({ limit: '50mb' }));
app.post('/fulfillment', (req, res) => {
  console.log("Fulfillment");
  const agent = new WebhookClient({ request: req, response: res });
  let intentMap = new Map();
  // Intent
  intentMap.set('Test Intent', testIntent);
  agent.handleRequest(intentMap);
});

app.listen(PORT, () => console.log(`Server is now listening on port ${PORT}`));