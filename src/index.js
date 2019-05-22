import 'babel-polyfill';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
//const mock = require('../mock/scoreboard.json');
//const game = mock.games[0];

const PORT = process.env.PORT || 3002;

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = d.getMonth() + 1;
  month = month < 10 ? `0${month}` : month
  const day = d.getDate();

  return `${year}${month}${day}`;
}

const getTodaysNBAScoreboard = async () => {
  const date = formatDate(Date.now());
  const res = await fetch(`https://data.nba.net/10s/prod/v1/${date}/scoreboard.json`);
  const game = await res.json();
  return game.games[0];
}

const getTodaysMLBScoreboard = async () => {
  const mlbTodayURI = 'http://statsapi.mlb.com/api/v1/schedule/games/?sportId=1';
  const res = await fetch(mlbTodayURI);
  const games = await res.json();
  return games.dates[0].games;
}

// const because a function would be hoisted, and the imports would happen after
export const init = async () => {
  try {
    const getNBAToday = async () => {
      const nbaGames = await getTodaysNBAScoreboard();
      const games = [nbaGames].flat().map(game => {
        return {
          city: game.arena.city,
          homeTeam: game.hTeam.triCode,
          homeScore: game.hTeam.score,
          awayTeam: game.vTeam.triCode,
          awayScore: game.vTeam.score
        }
      });

      return games;
    }

    const getMLBToday = async () => {
      const mlbGames = await getTodaysMLBScoreboard();
      const games = mlbGames.map(game => {

        return {
          park: game.venue.name,
          homeTeam: game.teams.home.team.name,
          homeScore: game.teams.home.score || 0,
          awayTeam: game.teams.away.team.name,
          awayScore: game.teams.away.score || 0
        }
      });

      return games;
    }

    //console.log(await getMLBToday());

    const app = express();
    const distPath = path.resolve(__dirname, '../dist');

    app.use(cors());
    app.use(express.static(distPath, {maxAge: 86400000}));

    app.listen(PORT, () => {
      console.log(`http:/localhost:${PORT}`)
    });

    app.get('/', (req, res) => {
      res.send("try /mlb or /nba");
    })

    app.get('/mlb', async (req, res) => {
      const scores = await getMLBToday();
      res.send(scores);
    })

  } catch (e) {
    console.log(e);
  }
}

init();
