/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const TIPSTER_INFO = `(
    SELECT 
        bettor, 
        COUNT(*) as numBets, 
        ROUND(SUM(dollarStake)) as dollarStake, 
        ROUND(SUM(dollarProfitLoss)) as dollarProfitLoss, 
        ROUND(SUM(dollarProfitLoss) * 100 / SUM(dollarStake), 2) as yield,
        ROUND(SUM(IF(dollarProfitLoss > 0, 1, 0)) / SUM(IF(dollarProfitLoss != 0, 1, 0)) * 100) as winningPerc,
        ROUND(AVG(isMaker), 2) as isMaker, 
        ROUND(AVG(decimalOdds), 2) as avgOdds,
        NOW() as updated_at
    FROM bet_details
    GROUP BY bettor
    HAVING numBets > 100
    ORDER BY SUM(dollarProfitLoss) DESC
	 ) as q`;
  return knex.schema
    .dropTableIfExists("stats_tipsters")
    .then(() =>
      knex.schema.createTable("stats_tipsters", function (table) {
        table.string("bettor").primary();
        table.integer("numBets");
        table.double("dollarStake");
        table.double("dollarProfitLoss");
        table.double("yield");
        table.double("winningPerc");
        table.double("isMaker");
        table.double("avgOdds");
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
      })
    )
    .then(() =>
      knex("stats_tipsters").insert(knex.select("*").fromRaw(TIPSTER_INFO))
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stats_tipsters");
};
