import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';


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
  try {
    axios.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${process.env.ODDS_KEY}`)
    .then((response: AxiosResponse) => {
      // Process the JSON data
      console.log(response.data);
      fs.writeFileSync("./info/match.json", JSON.stringify(response.data));
      console.log("Saved!") 

      res.send(JSON.stringify(100));
    })
    .catch((error: any) => {
      // Handle any errors
      console.error('Error fetching JSON:', error);
    });
  } catch (error) {
    console.log(error, ">> error occured from getStatus");
    res.send(JSON.stringify(-200));
  }
});

// make server listen on some port
((port = process.env.APP_PORT || 5000) => {
  server.listen(port, () => {
    console.log(`>> Listening on port ${port}`);
    return;
  });
})();