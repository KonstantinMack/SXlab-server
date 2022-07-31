/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const BETS_INFO = `(SELECT 
	 s.label as "sports", 
	 l.label as "league",
	 m.marketHash,
     m.gameTime,
	 m.teamOneName, 
	 m.teamTwoName,
	 m.type,
	 m.outcome,
	 b.bettor,
	 b.maker as isMaker,
	 b.bettingOutcomeOne,
	 1 / (b.odds / POWER(10, 20)) as decimal_odds,
	 t.token, 
	 COALESCE(cp.price, 1) as price,
     b.stake / POWER(10, t.decimals) as unit_stake,
	 b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) as dollar_stake,
     CASE
	 	WHEN m.outcome = 0 THEN 0
	 	WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	ELSE -b.stake / POWER(10, t.decimals)
	 END as unit_profit_loss,
	 CASE
	 	WHEN m.outcome = 0 THEN 0
	 	WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	ELSE -b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1)
	 END as dollar_profit_loss,
	 b.date as bet_date
     FROM bets b
     JOIN markets m ON b.marketHash = m.marketHash
     JOIN leagues l ON m.leagueId = l.leagueId
     JOIN sports s ON m.sportId = s.sportID
     JOIN tokens t ON b.baseToken = t.baseToken
     LEFT JOIN crypto_prices cp ON b.date = cp.date AND b.baseToken = cp.baseToken) as q`;
  return knex.schema.createView("bet_details_view", function (view) {
    view.columns([
      "sports",
      "league",
      "marketHash",
      "gameTime",
      "teamOneName",
      "teamTwoName",
      "type",
      "outcome",
      "bettor",
      "isMaker",
      "bettingOutcomeOne",
      "decimal_odds",
      "token",
      "price",
      "unit_stake",
      "dollar_stake",
      "unit_profit_loss",
      "dollar_profit_loss",
      "bet_date",
    ]);
    view.as(knex.select("*").fromRaw(BETS_INFO));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropViewIfExists("bet_details_view");
};
