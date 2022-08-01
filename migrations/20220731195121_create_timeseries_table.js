/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const TIME_SERIES_INFO = `(
    SELECT 
        NULL as id,
        betDate, 
        token, 
        COUNT(*) as numberOfBets, 
        SUM(dollarStake) as totalDollarMatched, 
        AVG(dollarStake) as avgDollarBetSize,
        SUM(dollarFees) as totalDollarFees,
        SUM(unitFees) as totalUnitFees,
        NOW() as updated_at
    FROM bet_details
    GROUP BY betDate, token
	 ) as q`;
  return knex.schema
    .createTable("stats_time_series", function (table) {
      table.increments("id").primary();
      table.date("betDate").index();
      table.string("token").index();
      table.integer("numberOfBets");
      table.double("totalDollarMatched");
      table.double("avgDollarBetSize");
      table.double("totalDollarFees");
      table.double("totalUnitFees");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .then(() =>
      knex("stats_time_series").insert(
        knex.select("*").fromRaw(TIME_SERIES_INFO)
      )
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stats_time_series");
};
