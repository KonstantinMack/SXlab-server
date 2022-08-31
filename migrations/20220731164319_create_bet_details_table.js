/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const BETS_INFO = `(
    SELECT 
      _id,
      s.label as "sports", 
      l.label as "league",
      m.marketHash,
      m.gameTime,
      m.teamOneName, 
      m.teamTwoName,
    CASE
      WHEN m.type IN ('52', '63', '88', '202', '203', '204', '205', '226', '274') THEN "MONEY_LINE"
      WHEN m.type IN ('2', '28', '29', '77', '165', '166', '835', '1536') THEN "OVER_UNDER"
      WHEN m.type IN ('3', '53', '201', '342', '866') THEN "SPREAD"
      ELSE m.type
    END as 'type',
      m.outcome,
      b.bettor,
      b.maker as isMaker,
      b.bettingOutcomeOne,
      1 / (b.odds / POWER(10, 20)) as decimalOdds,
      t.token, 
      COALESCE(cp.price, 1) as price,
      b.stake / POWER(10, t.decimals) as unitStake,
      b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) as dollarStake,
    CASE
	 	  WHEN m.outcome = 0 THEN 0
	 	  WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	  WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	  ELSE -b.stake / POWER(10, t.decimals)
	  END as unitProfitLoss,
	  CASE
	 	  WHEN m.outcome = 0 THEN 0
	 	  WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	  WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.96)
	 	  ELSE -b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1)
	  END as dollarProfitLoss,
    CASE
	 	  WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.04)
	 	  WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.04)
	 	  ELSE 0
	  END as unitFees,
	  CASE
	 	  WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.04)
	 	  WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * 0.04)
	 	  ELSE 0
	  END as dollarFees,
	    b.date as betDate,
      NOW() as updatedAt
    FROM bets b
    JOIN markets m ON b.marketHash = m.marketHash
    JOIN leagues l ON m.leagueId = l.leagueId
    JOIN sports s ON m.sportId = s.sportID
    JOIN tokens t ON b.baseToken = t.baseToken
    LEFT JOIN crypto_prices cp ON b.date = cp.date AND b.baseToken = cp.baseToken
    ) as q`;
  return knex.schema
    .createTable("bet_details", function (table) {
      table.string("_id").primary();
      table.string("sports").index();
      table.string("league").index();
      table.string("marketHash");
      table.integer("gameTime").unsigned();
      table.string("teamOneName");
      table.string("teamTwoName");
      table.string("type").index();
      table.string("outcome");
      table.string("bettor").index();
      table.boolean("isMaker");
      table.boolean("bettingOutcomeOne");
      table.float("decimalOdds");
      table.string("token").index();
      table.float("price");
      table.float("unitStake");
      table.float("dollarStake");
      table.float("unitProfitLoss");
      table.float("dollarProfitLoss");
      table.float("unitFees");
      table.float("dollarFees");
      table.date("betDate");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .then(() =>
      knex("bet_details").insert(knex.select("*").fromRaw(BETS_INFO))
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("bet_details");
};
