/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const MARKETS_INFO = `(
    SELECT
        NULL as id,
	    sports,
	    league,
	    teamOneName, 
	    teamTwoName, 
	    gameTime,
	    COUNT(*) as numberOfBets,
	    SUM(dollarStake) as totalVolumeMatched,
	    SUM(dollarFees) as totalDollarFees,
        NOW() as updatedAt        
    FROM bet_details
    GROUP BY sports, league, teamOneName, teamTwoName, gameTime
    ORDER BY totalVolumeMatched DESC
	 ) as q`;
  return knex.schema
    .dropTableIfExists("stats_by_markets")
    .then(() =>
      knex.schema.createTable("stats_by_markets", function (table) {
        table.increments("id").primary();
        table.string("sports");
        table.string("league");
        table.string("teamOneName");
        table.string("teamTwoName");
        table.integer("gameTime").unsigned();
        table.integer("numberOfBets");
        table.float("totalVolumeMatched");
        table.float("totalDollarFees");
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
      })
    )
    .then(() =>
      knex("stats_by_markets").insert(knex.select("*").fromRaw(MARKETS_INFO))
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stats_by_markets");
};
