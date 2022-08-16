require("dotenv").config();
const BetDetails = require("../models/BetDetails");
const Favourites = require("../models/Favourites");
const { SPORTS } = require("../util/globals");

const sportArray = SPORTS.map((ele) => `'${ele}'`).join(", ");

const fetchTipsters = async (req, res) => {
  const sport = req.query.sport;
  const numBets = req.query.numBets || 100;

  let sportQuery;
  if (sport === "All") {
    sportQuery = "";
  } else if (sport === "Other") {
    sportQuery = `WHERE sports NOT IN (${sportArray})`;
  } else {
    sportQuery = `WHERE sports = '${sport}'`;
  }

  const query = `
    SELECT 
        bettor, 
        COUNT(*) as numBets, 
        ROUND(SUM(dollarStake)) as dollarStake, 
        ROUND(SUM(dollarProfitLoss)) as dollarProfitLoss, 
        ROUND(SUM(dollarProfitLoss) * 100 / SUM(dollarStake), 2) as yield,
        ROUND(SUM(IF(dollarProfitLoss > 0, 1, 0)) / SUM(IF(dollarProfitLoss != 0, 1, 0)) * 100) as winningPerc,
        ROUND(AVG(isMaker), 2) as isMaker, 
        ROUND(AVG(decimalOdds), 2) as avgOdds
    FROM bet_details
    ${sportQuery}
    GROUP BY bettor
    HAVING numBets > ${numBets}
    ORDER BY SUM(dollarProfitLoss) DESC
    `;

  const knexBetDetails = BetDetails.knex();
  const stats = await knexBetDetails.raw(query);
  res.status(200).json(stats[0]);
};

const starTipster = async (req, res) => {
  const { address, bettor } = req.body;
  await Favourites.query()
    .insert({ address, bettor })
    .then((favourite) => res.status(201).json({ favourite }))
    .catch((error) => res.status(400).json({ error }));
};

const unstarTipster = async (req, res) => {
  const { address, bettor } = req.body;
  await Favourites.query()
    .delete()
    .where("address", "=", address)
    .where("bettor", "=", bettor)
    .then((deletedEntries) => res.status(201).json({ deletedEntries }))
    .catch((error) => res.status(400).json({ error }));
};

const fetchFavourites = async (req, res) => {
  const address = req.query.address;
  const favourites = await Favourites.query()
    .select("bettor")
    .where("address", "=", address);
  res.status(200).json(favourites.map((fav) => fav.bettor));
};

module.exports = {
  fetchTipsters,
  starTipster,
  unstarTipster,
  fetchFavourites,
};
