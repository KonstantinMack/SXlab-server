/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const BETS_INFO = `(
    SELECT
        token,
        sports,
        league,
        type,
        COUNT(*) as numberOfBets,
        AVG(dollar_stake) as avgDollarBetSize,
        SUM(dollar_stake) as totalDollarMatched,
        NOW() as updated_at
    FROM bet_details_view
    GROUP BY token, sports, league, type
	 ) as q`;
  return knex.schema
    .createTable("stats_overall", function (table) {
      table.string("token").index();
      table.string("sports").index();
      table.string("league").index();
      table.string("type").index();
      table.integer("numberOfBets");
      table.double("avgDollarBetSize");
      table.double("totalDollarMatched");
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .then(() =>
      knex("stats_overall").insert(knex.select("*").fromRaw(BETS_INFO))
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stats_overall");
};
