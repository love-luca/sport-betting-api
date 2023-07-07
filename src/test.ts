import * as https from 'https';

// Start the app
DemoApiNgClient();

// Main class that contains all operations
export function DemoApiNgClient(): void {

  // App key
  const appkey = "LK0lph8MsgVoM6SU";
  // Session token
  const ssid = "Dm0+3j9hFYdhI3B6FmICEkCx9UOWzPGL4EkHVxsl8Ec=";
  
  const FIRST_INDEX = 0;
  const DEFAULT_ENCODING = 'utf-8';
  const DEFAULT_JSON_FORMAT = '\t';

  const options: https.RequestOptions = {
    hostname: 'api.betfair.com',
    port: 443,
    path: '/exchange/betting/json-rpc/v1',
    method: 'POST',
    headers: {
      'X-Application': appkey,
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'X-Authentication': ssid
    }
  };

  start();

  // Start from finding the horse race event type id
  function start(): void {
    findHorseRaceId(options);
  }

  // Construct request and POST it to API-NG
  function findHorseRaceId(options: https.RequestOptions): void {
    console.log("Get horse racing event id");
    // Define Horse Racing in filter object
    const requestFilters = '{"filter":{}}';
    const jsonRequest = constructJsonRpcRequest('listEventTypes', requestFilters);
    let str = '';
    const req = https.request(options, (res) => {
      res.setEncoding(DEFAULT_ENCODING);
      res.on('data', (chunk) => {
        str += chunk;
      });

      res.on('end', () => {
        // On response parse JSON and check for errors
        const response = JSON.parse(str);
        handleError(response);
        // Retrieve id from response and get next available horse race
        getNextAvailableHorseRace(options, response);
      });
    });
    // Send JSON request object
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();

    req.on('error', (e) => {
      console.log('Problem with request: ' + e.message);
    });
  }

  // Get next horse race based on current date
  function getNextAvailableHorseRace(options: https.RequestOptions, response: any): void {
    // Retrieve event id from previous response
    const eventId = retrieveEventId(response);
    const jsonDate = new Date().toJSON();
    console.log("Get next available horse race starting from date: " + jsonDate);
    let str = '';
    const requestFilters = '{"filter":{"eventTypeIds": [' + eventId + '],"marketCountries":["GB"],"marketTypeCodes":["WIN"],"marketStartTime":{"from":"' + jsonDate + '"}},"sort":"FIRST_TO_START","maxResults":"1","marketProjection":["RUNNER_DESCRIPTION"]}';
    const jsonRequest = constructJsonRpcRequest('listMarketCatalogue', requestFilters);

    const req = https.request(options, (res) => {
      res.setEncoding(DEFAULT_ENCODING);
      res.on('data', (chunk) => {
        str += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(str);
        handleError(response);
        // Get list of runners that are available in that race
        getListOfRunners(options, response);
      });
    });
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();
    req.on('error', (e) => {
      console.log('Problem with request: ' + e.message);
    });
  }

  function getListOfRunners(options: https.RequestOptions, response: any): void {
    const marketId = retrieveMarketId(response);
    console.log("Get list of runners for market Id: " + marketId);
    const requestFilters = '{"marketIds":["' + marketId + '"],"priceProjection":{"priceData":["EX_BEST_OFFERS"],"exBestOfferOverRides":{"bestPricesDepth":2,"rollupModel":"STAKE","rollupLimit":20},"virtualise":false,"rolloverStakes":false},"orderProjection":"ALL","matchProjection":"ROLLED_UP_BY_PRICE"}';
    const jsonRequest = constructJsonRpcRequest('listMarketBook', requestFilters);
    let str = '';
    const req = https.request(options, (res) => {
      res.setEncoding(DEFAULT_ENCODING);
      res.on('data', (chunk) => {
        str += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(str);
        handleError(response);
        // Place bet on first runner
        placeBet(options, response, marketId);
      });
    });
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();
    req.on('error', (e) => {
      console.log('Problem with request: ' + e.message);
      return;
    });
  }

  function placeBet(options: https.RequestOptions, response: any, marketId: string): void {
    let str = '';
    const selectionId = retrieveSelectionId(response);
    // Invalid price and size, change that to minimum price of 2.0
    const price = '2';
    const size = '0.01';
    const customerRef = new Date().getMilliseconds();
    console.log("Place bet on runner with selection Id: " + selectionId);
    const requestFilters = '{"marketId":"' + marketId + '","instructions":[{"selectionId":"' + selectionId + '","handicap":"0","side":"BACK","orderType":"LIMIT","limitOrder":{"size":"' + size + '","price":"' + price + '","persistenceType":"LAPSE"}}],"customerRef":"' + customerRef + '"}';
    const jsonRequest = constructJsonRpcRequest('placeOrders', requestFilters);
    const req = https.request(options, (res) => {
      res.setEncoding(DEFAULT_ENCODING);
      res.on('data', (chunk) => {
        str += chunk;
      });
      res.on('end', () => {
        const response = JSON.parse(str);
        handleError(response);
        console.log(JSON.stringify(response, null, DEFAULT_JSON_FORMAT));
      });
    });
    req.write(jsonRequest, DEFAULT_ENCODING);
    req.end();
    req.on('error', (e) => {
      console.log('Problem with request: ' + e.message);
    });
  }

  // Get event id from the response
  function retrieveEventId(response: any) {
    for (let i = 0; i <= Object.keys(response.result).length; i++) {
      if (response.result[i].eventType.name === 'Horse Racing') {
        return response.result[i].eventType.id;
      }
    }
  }

  // Get selection id from the response
  function retrieveSelectionId(response: any): string {
    return response.result[FIRST_INDEX].runners[FIRST_INDEX].selectionId;
  }

  // Get market id from the response
  function retrieveMarketId(response: any): string {
    return response.result[FIRST_INDEX].marketId;
  }

  function constructJsonRpcRequest(operation: string, params: string): string {
    return '{"jsonrpc":"2.0","method":"SportsAPING/v1.0/' + operation + '", "params": ' + params + ', "id": 1}';
  }

  // Handle Api-NG errors, exception details are wrapped within response object
  function handleError(response: any): void {
    // check for errors in response body, we can't check for status code as jsonrpc returns always 200
    if (response.error != null) {
      // if error in response contains only two fields it means that there is no detailed message of exception thrown from API-NG
      if (Object.keys(response.error).length > 2) {
        console.log("Error with request!!");
        console.log(JSON.stringify(response, null, DEFAULT_JSON_FORMAT));
        console.log("Exception Details: ");
        console.log(JSON.stringify(retrieveExceptionDetails(response), null, DEFAULT_JSON_FORMAT));
      }
      process.exit(1);
    }
  }

  // Get exception message out of a response object
  function retrieveExceptionDetails(response: any): string {
    return response.error.data.APINGException;
  }
}

