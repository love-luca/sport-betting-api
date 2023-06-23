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
    .then(async(response: AxiosResponse) => {
      // Process the JSON data
      fs.writeFileSync("./info/match.json", JSON.stringify(response.data));
      console.log("Saved!") 

      const matchSpec = response.data;
      
      let americanFootball: any[] = [];
      let aussieRules: any[] = [];
      let baseball: any[] = [];
      let basketball: any[] = [];
      let boxing: any[] = [];
      let cricket: any[] = [];
      let golf: any[] = [];
      let iceHockey: any[] = [];
      let mma: any[] = [];
      let rugby: any[] = [];
      let soccer: any[] = [];

      for (const matchItem of matchSpec) {
          if (matchItem.group === "American Football") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              americanFootball.push(obj);
            })
          }
          if (matchItem.group === "Aussie Rules") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              aussieRules.push(obj);
            })
          }
          if (matchItem.group === "Baseball") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              baseball.push(obj);
            })
          }
          if (matchItem.group === "Basketball") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              basketball.push(obj);
            })
          }
          if (matchItem.group === "Boxing") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              boxing.push(obj);
            })
          }
          if (matchItem.group === "Cricket") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              cricket.push(obj);
            })
          }
          if (matchItem.group === "Golf") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              golf.push(obj);
            })
          }
          if (matchItem.group === "Ice Hockey") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              iceHockey.push(obj);
            })
          }
          if (matchItem.group === "Mixed Martial Arts") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              mma.push(obj);
            })
          }
          if (matchItem.group === "Rugby League") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              rugby.push(obj);
            })
          }
          if (matchItem.group === "Soccer") {
            const axiosResult = await axios.get(`https://api.the-odds-api.com/v4/sports/${matchItem.key}/scores/?apiKey=${process.env.ODDS_KEY}`);
            axiosResult.data.map((obj: any) => {
              soccer.push(obj);
            })
          }
      }

      console.log(americanFootball);
      fs.writeFileSync("./info/americanFootball.json", JSON.stringify(americanFootball));
      fs.writeFileSync("./info/aussieRules.json", JSON.stringify(aussieRules));
      fs.writeFileSync("./info/baseball.json", JSON.stringify(baseball));
      fs.writeFileSync("./info/basketball.json", JSON.stringify(basketball));
      fs.writeFileSync("./info/boxing.json", JSON.stringify(boxing));
      fs.writeFileSync("./info/cricket.json", JSON.stringify(cricket));
      fs.writeFileSync("./info/golf.json", JSON.stringify(golf));
      fs.writeFileSync("./info/iceHockey.json", JSON.stringify(iceHockey));
      fs.writeFileSync("./info/mma.json", JSON.stringify(mma));
      fs.writeFileSync("./info/rugby.json", JSON.stringify(rugby));
      fs.writeFileSync("./info/soccer.json", JSON.stringify(soccer));

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