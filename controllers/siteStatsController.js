const StatsOverall = require("../models/StatsOverall");
const StatsTimeSeries = require("../models/StatsTimeSeries");
const StatsBySports = require("../models/StatsBySports");
const StatsByMarkets = require("../models/StatsByMarkets");

const fetchStatsBySports = async (_req, res) => {
  const addresses = await StatsBySports.query();
  res.status(200).json(addresses);
};

const fetchStatsByTokenAndSports = async (_req, res) => {
  const knexStatsOverall = StatsOverall.knex();
  const stats = await knexStatsOverall.raw(
    `
    SELECT 
      token, 
      sports, 
      SUM(numberOfBets) as numberOfBets, 
      ROUND(SUM(totalDollarMatched), 2) as totalDollarMatched, 
      ROUND(SUM(totalDollarMatched) / SUM(numberOfBets), 2) as avgDollarBetSize, 
      ROUND(SUM(totalDollarFees), 2) as totalDollarFees, ROUND(SUM(totalUnitFees), 2) as totalUnitFees 
    FROM stats_overall 
    GROUP BY token, sports
    `
  );
  res.status(200).json(stats[0]);
};

const fetchStatsByTime = async (req, res) => {
  const timeframe = req.query.timeframe;

  switch (timeframe.toLowerCase().trim()) {
    case "week":
      timeQuery = "YEAR(betDate) as `year`, WEEK(betDate) as `week`,";
      break;

    case "month":
      timeQuery = "YEAR(betDate) as `year`, MONTH(betDate) as `month`,";
      break;

    default:
      timeQuery = "YEAR(betDate) as `year`, YEAR(betDate) as `year2`,";
      break;
  }

  const query = `
    SELECT 
      token,
      ${timeQuery} 
  	  SUM(numberOfBets) as numberOfBets,
	    ROUND(SUM(totalDollarMatched), 2) as totalDollarMatched,
	    ROUND(SUM(totalDollarFees), 2) as totalDollarFees
    FROM stats_time_series
    GROUP BY 1, 2, 3
  `;

  const knexStatsTimeSeries = StatsTimeSeries.knex();
  const stats = await knexStatsTimeSeries.raw(query);
  res.status(200).json(stats[0]);
};

const fetchPopularMarkets = async (_req, res) => {
  const markets = await StatsByMarkets.query()
    .orderBy("totalVolumeMatched", "desc")
    .limit(50);
  res.status(200).json(markets);
};

module.exports = {
  fetchStatsBySports,
  fetchStatsByTokenAndSports,
  fetchStatsByTime,
  fetchPopularMarkets,
};
