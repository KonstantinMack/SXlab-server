const StatsOverall = require("../models/StatsOverall");
const StatsTimeSeries = require("../models/StatsTimeSeries");
const StatsBySports = require("../models/StatsBySports");
const StatsByMarkets = require("../models/StatsByMarkets");
const BetDetails = require("../models/BetDetails");
const UpdateTime = require("../models/UpdateTime");

const { SPORTS } = require("../util/globals");

const sportArray = SPORTS.map((ele) => `'${ele}'`).join(", ");

const fetchUpdateTime = async (_req, res) => {
  const updateTime = await UpdateTime.query()
    .select("updatedAt")
    .orderBy("id", "desc")
    .limit(1);
  res.status(200).json(updateTime);
};

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
      'All' AS sports, 
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
  const sport = req.query.sport;

  switch (sport.toLowerCase().trim()) {
    case "other":
      sportQuery = `WHERE sports not in (${sportArray})`;
      break;

    default:
      sportQuery = `WHERE sports = '${sport}'`;
      break;
  }

  const query = `
    SELECT 
      token,
      year,
      month,
  	  SUM(numberOfAddresses) as numberOfAddresses,
  	  SUM(numberOfBets) as numberOfBets,
	    ROUND(SUM(totalDollarMatched), 2) as totalDollarMatched,
	    ROUND(SUM(totalDollarFees), 2) as totalDollarFees
    FROM stats_time_series
    ${sportQuery}
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
    .map((sport) => `'${sport}'`)
    .join(", ");
  const query = `
    SELECT 'All' as sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ('MONEY_LINE', 'OVER_UNDER', 'SPREAD')
    GROUP BY 1, 2
    UNION ALL
    SELECT sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ('MONEY_LINE', 'OVER_UNDER', 'SPREAD') AND sports IN (${sportsString})
    GROUP BY 1, 2
    UNION ALL
    SELECT 'Other' AS sports, type as betType, SUM(totalDollarMatched) as totalDollarMatched
    FROM stats_overall
    WHERE type in ('MONEY_LINE', 'OVER_UNDER', 'SPREAD') AND sports NOT IN (${sportsString})
    GROUP BY 1, 2
    `;

  const knexStatsOverall = StatsOverall.knex();
  const stats = await knexStatsOverall.raw(query);
  res.status(200).json(stats[0]);
};

const fetchStatsByBetTime = async (_req, res) => {
  const query = `
    SELECT 
	    CASE
		    WHEN betTime > gameTime THEN 'inplay'
		    ELSE 'pregame'
      END as betTime,
      SUM(dollarStake) as dollarStake,
      AVG(dollarStake) as avgStake,
      COUNT(DISTINCT bettor) as users
    FROM bet_details
    GROUP BY 1
  `;
  const knexStatsBetTime = BetDetails.knex();
  const stats = await knexStatsBetTime.raw(query);
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
  fetchUpdateTime,
  fetchStatsBySports,
  fetchStatsByTokenAndSports,
  fetchStatsByTime,
  fetchStatsByBetTime,
  fetchStatsByBetType,
  fetchPopularMarkets,
};
