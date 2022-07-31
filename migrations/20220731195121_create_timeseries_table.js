/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const TIME_SERIES_INFO = `(
    SELECT 
        bet_date, 
        token, 
        COUNT(*) as numberOfBets, 
        SUM(dollar_stake) as totalDollarMatched, 
        AVG(dollar_stake) as avgDollarBetSize,
        NOW() as updated_at
    FROM bet_details_view
    GROUP BY bet_date, token
	 ) as q`;
  return knex.schema
    .createTable("stats_time_series", function (table) {
      table.date("bet_date").index();
      table.string("token").index();
      table.integer("numberOfBets");
      table.double("totalDollarMatched");
      table.double("avgDollarBetSize");
      table.timestamp("updated_at").defaultTo(knex.fn.now());
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
