const BetDetails = require("../models/BetDetails");
const { SPORTS } = require("../util/globals");

const fetchTipsters = async (req, res) => {
  const sport = req.query.sport;
  const numBets = req.query.numBets || 100;

  const sportArray = SPORTS.map((ele) => `"${ele}"`).join(", ");

  let sportQuery;
  if (sport === "All") {
    sportQuery = "";
  } else if (sport === "Other") {
    sportQuery = `WHERE sports NOT IN (${sportArray})`;
  } else {
    sportQuery = `WHERE sports = "${sport}"`;
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

module.exports = {
  fetchTipsters,
};
