require("dotenv").config();
const axios = require("axios");
const BetDetails = require("../models/BetDetails");
const Users = require("../models/Users");
const { SPORTS } = require("../util/globals");

const sportArray = SPORTS.map((ele) => `'${ele}'`).join(", ");

const fetchStatsByAddress = async (req, res) => {
  const sport = req.query.sport;
  const address = req.query.address;

  let sportQuery;
  if (sport === "All") {
    sportQuery = "";
  } else if (sport === "Other") {
    sportQuery = `AND sports NOT IN (${sportArray})`;
  } else {
    sportQuery = `AND sports = '${sport}'`;
  }

  const query = `
    SELECT 
        bettor, 
        COUNT(*) as numBets, 
        ROUND(SUM(dollarStake)) as dollarStake,
        ROUND(AVG(dollarStake)) as avgDollarStake,
        ROUND(SUM(dollarProfitLoss)) as dollarProfitLoss, 
        ROUND(SUM(dollarProfitLoss) * 100 / SUM(dollarStake), 2) as yield,
        CAST(SUM(IF(dollarProfitLoss > 0, 1, 0)) AS SIGNED) as betsWon,
        CAST(SUM(IF(dollarProfitLoss = 0, 1, 0)) AS SIGNED)as betsPushed,
        CAST(SUM(IF(dollarProfitLoss < 0, 1, 0)) AS SIGNED)as betsLost,
        ROUND(AVG(isMaker), 2) as isMaker, 
        ROUND(AVG(decimalOdds), 2) as avgOdds
    FROM bet_details
    WHERE bettor = '${address}'
    ${sportQuery}
    GROUP BY bettor
    `;

  const knexBetDetails = BetDetails.knex();
  const response = await knexBetDetails.raw(query);
  const stats = response[0].length
    ? response[0]
    : [
        {
          bettor: address,
          numBets: 0,
          dollarStake: 0,
          avgDollarStake: 0,
          dollarProfitLoss: 0,
          yield: 0,
          betsWon: 0,
          betsPushed: 0,
          betsLost: 0,
          isMaker: "-",
          avgOdds: "-",
        },
      ];
  res.status(200).json(stats);
};

const fetchStatsByDate = async (req, res) => {
  const sport = req.query.sport;
  const address = req.query.address;

  let sportQuery;
  if (sport === "All") {
    sportQuery = "";
  } else if (sport === "Other") {
    sportQuery = `AND sports NOT IN (${sportArray})`;
  } else {
    sportQuery = `AND sports = '${sport}'`;
  }

  const query = `
    SELECT 
      bettor, 
      betDate, 
      SUM(dollarStake) as dollarStake, 
      SUM(dollarProfitLoss) as dollarProfitLoss, 
      COUNT(*) as numBets
    FROM bet_details
    WHERE bettor = '${address}'
    ${sportQuery}
    GROUP BY bettor, betDate
    ORDER BY betDate ASC
  `;

  const knexBetDetails = BetDetails.knex();
  const stats = await knexBetDetails.raw(query);
  res.status(200).json(stats[0]);
};

const fetchStatsBySport = async (req, res) => {
  const address = req.query.address;

  const query = `
    SELECT bettor, sports, SUM(dollarStake) as dollarStake, SUM(dollarProfitLoss) as dollarProfitLoss
    FROM bet_details
    WHERE bettor = '${address}'
    GROUP BY bettor, sports;
  `;

  const knexBetDetails = BetDetails.knex();
  const stats = await knexBetDetails.raw(query);
  res.status(200).json(stats[0]);
};

const fetchOpenBets = async (req, res) => {
  const address = req.query.address;
  const BETS_URL = "https://api.sx.bet/trades";
  const MARKETS_URL = "https://api.sx.bet/markets/find";
  const headers = process.env.SX_API_KEY
    ? {
        "X-Api-Key": process.env.SX_API_KEY,
      }
    : {};
  const bets_payload = {
    bettor: address,
    settled: false,
    tradeStatus: "SUCCESS",
  };

  const bets = await axios
    .post(BETS_URL, bets_payload, { headers })
    .then((response) => response.data.data)
    .catch((err) => ({ message: err, trades: [] }));

  if (bets.trades.length) {
    const market_payload = {
      marketHashes: bets.trades.slice(0, 50).map((bet) => bet.marketHash),
    };
    const markets = await axios
      .post(MARKETS_URL, market_payload, { headers })
      .then((response) => response.data.data)
      .catch((err) => ({ message: err }));

    res.status(200).json(
      bets.trades
        .slice(0, 50)
        .map((bet) => {
          return {
            ...bet,
            market: markets.find(
              (market) => market.marketHash === bet.marketHash
            ),
          };
        })
        .filter((bet) => bet.market.gameTime > new Date().getTime() / 1000)
        .sort((a, b) => a.market.gameTime - b.market.gameTime)
    );
  } else {
    res.status(200).json(bets.trades);
  }
};

const addUser = async (req, res) => {
  const { address } = req.body;
  await Users.query()
    .insert({ address })
    .then((user) => res.status(201).json(user))
    .catch((err) => res.status(400).json({ error: "User already exists" }));
};

module.exports = {
  fetchStatsByAddress,
  fetchStatsByDate,
  fetchStatsBySport,
  fetchOpenBets,
  addUser,
};
