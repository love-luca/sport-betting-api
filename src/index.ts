import express, { response } from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import { DemoApiNgClient } from './test';
import request from 'request';


// load the environment variables from the .env file
dotenv.config({
  path: '.env'
});

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  res.send(JSON.stringify(0));
});

app.get('/getStatus', async (req, res) => {
  // DemoApiNgClient();
  // App key
  var appkey = process.env.APP_KEY;
  // Session token
  var ssid = process.env.SSID;

  var FIRST_INDEX = 0;
  var DEFAULT_ENCODING = 'utf-8';
  var DEFAULT_JSON_FORMAT = '\t';

  console.log("====================", appkey);
  console.log("=======================", ssid);

  var requestFilters = '{"filter":{}}';
  var jsonRequest = constructJsonRpcRequest("listEvents", requestFilters);
  console.log(jsonRequest);
  var options = {
    // hostname: 'api.betfair.com',
    // port: 443,
    // path: '/exchange/betting/json-rpc/v1',
    url: 'https://api.betfair.com/exchange/betting/json-rpc/v1',
    headers: {
      'X-Application': appkey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Authentication': ssid
    },
    body: jsonRequest,
  }

  request.post(options, (err, response, body) => {
    if (err) {
      console.error(err);
      console.log('====errrr');
      res.status(500).send(err);
      return;
    }
    // console.dir(body, {depth: null});
    console.log(body)
    console.log('====body');
    res.json(body);
  })
});

export function buildUrl(operation: string) {
  return 'https://api.betfair.com/exchange/betting/json-rpc/v1';
}
export function constructJsonRpcRequest(operation: string, params: string) {
  return '{"jsonrpc":"2.0","method":"SportsAPING/v1.0/' + operation + '", "params": ' + params + ', "id": 1}';
}

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.listen(port, () => {
    console.log(`>> Listening on port ${port}`);
    return;
  });
})();
