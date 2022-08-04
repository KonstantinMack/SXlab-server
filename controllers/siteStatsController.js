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
      "All" AS sports, 
      SUM(numberOfBets) as numberOfBets, 
      ROUND(SUM(totalDollarMatched), 2) as totalDollarMatched, 
      ROUND(SUM(totalDollarMatched) / SUM(numberOfBets), 2) as avgDollarBetSize, 
      ROUND(SUM(totalDollarFees), 2) as totalDollarFees, ROUND(SUM(totalUnitFees), 2) as totalUnitFees 
    FROM stats_overall 
    GROUP BY token

    UNION ALL

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

const fetchStatsByBetType = async (req, res) => {
  const sports = req.query.sports;
  const sportsString = sports
    .split(",")
    .map((sport) => `"${sport}"`)
    .join(", ");
  const query = `
    SELECT "All" as sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ("MONEY_LINE", "OVER_UNDER", "SPREAD")
    GROUP BY 1, 2
    UNION ALL
    SELECT sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ("MONEY_LINE", "OVER_UNDER", "SPREAD") AND sports IN (${sportsString})
    GROUP BY 1, 2
    UNION ALL
    SELECT "Other" AS sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ("MONEY_LINE", "OVER_UNDER", "SPREAD") AND sports NOT IN (${sportsString})
    GROUP BY 1, 2
    `;

  const knexStatsOverall = StatsOverall.knex();
  const stats = await knexStatsOverall.raw(query);
  res.status(200).json(stats[0]);
};

const fetchPopularMarkets = async (req, res) => {
  const numMarkets = req.query.number;
  const sport = req.query.sport;
  const other = req.query.other;
  const otherOperator = other === "true" ? "not in" : "in";

  let markets;

  if (sport === "All") {
    markets = await StatsByMarkets.query()
      .orderBy("totalVolumeMatched", "desc")
      .limit(numMarkets);
  } else {
    markets = await StatsByMarkets.query()
      .where("sports", otherOperator, sport.split(","))
      .orderBy("totalVolumeMatched", "desc")
      .limit(numMarkets);
  }
  res.status(200).json(markets);
};

module.exports = {
  fetchStatsBySports,
  fetchStatsByTokenAndSports,
  fetchStatsByTime,
  fetchStatsByBetType,
  fetchPopularMarkets,
};
