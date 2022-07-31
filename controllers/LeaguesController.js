const Leagues = require("../models/Leagues");

const findAll = async (_req, res) => {
  const leagues = await Leagues.query()
    .select(
      "leagues.*",
      "s.label as sportsLabel",
      "m.teamOneName",
      "m.teamTwoName",
      "m:b.bettor",
      "m:b:t.decimals"
    )
    .joinRelated("[sports, markets.[bets.[tokens]]]", {
      aliases: {
        sports: "s",
        markets: "m",
        bets: "b",
        tokens: "t",
      },
    })
    .limit(10);
  res.status(200).json(leagues);
};

module.exports = {
  findAll,
};
