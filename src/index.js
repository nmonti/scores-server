import 'babel-polyfill';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
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

// const because a function would be hoisted, and the imports would happen after
export const init = async () => {
  try {

    const game = await getTodaysNBAScoreboard();
    console.log(game);
    const typeDefs = [`
      type Query {
        nbaToday: NBAScoreboard
      }

      type NBAScoreboard {
        _id: ID!
        city: String!
        homeTeam: String
        homeScore: Int
        awayTeam: String
        awayScore: Int
      }

      schema {
        query: Query
      }
    `];

    const resolvers = {
      Query: {
        nbaToday: async () => {
          return await Promise.resolve({
            city: game.arena.city,
            homeTeam: game.hTeam.triCode,
            homeScore: game.hTeam.score,
            awayTeam: game.vTeam.triCode,
            awayScore: game.vTeam.score
          });
        }
      }
    };

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    });

    const app = express();
    const distPath = path.resolve(__dirname, '../dist');

    app.use(cors());
    app.use(express.static(distPath, {maxAge: 86400000}));
    app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
    app.use('/graphiql', graphiqlExpress({
      endpointURL: '/graphql'
    }));

    app.listen(PORT, () => {
      console.log(`http:/localhost:${PORT}`)
    });

  } catch (e) {
    console.log(e)
  }
}

init();
