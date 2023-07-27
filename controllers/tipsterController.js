require("dotenv").config();
const BetDetails = require("../models/BetDetails");
const Favourites = require("../models/Favourites");
const StatsTipsters = require("../models/StatsTipsters");
const { SPORTS } = require("../util/globals");

const sportArray = SPORTS.map((ele) => `'${ele}'`).join(", ");

const fetchTipsters = async (req, res) => {
  const sport = req.query.sport;
  const numBets = req.query.numBets || 100;

  const stats = await StatsTipsters.query()
    .where("sport", "=", sport)
    .orderBy("dollarProfitLoss", "desc");

  res.status(200).json(stats);
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
