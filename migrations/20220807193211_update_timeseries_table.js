/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const TIME_SERIES_INFO = `(
    SELECT 
        NULL as id,
        YEAR(betDate) as year, 
        MONTH(betDate) as month,
        'All' as sports,
        token,
        COUNT(DISTINCT(bettor)) AS numberOfAddresses,
        COUNT(*) as numberOfBets, 
        SUM(dollarStake) as totalDollarMatched, 
        AVG(dollarStake) as avgDollarBetSize,
        SUM(dollarFees) as totalDollarFees,
        SUM(unitFees) as totalUnitFees,
        NOW() as updated_at
    FROM bet_details
    GROUP BY YEAR(betDate), MONTH(betDate), token
    
    UNION ALL

    SELECT 
        NULL as id,
        YEAR(betDate) as year, 
        MONTH(betDate) as month,
        sports,
        token,
        COUNT(DISTINCT(bettor)) AS numberOfAddresses,
        COUNT(*) as numberOfBets, 
        SUM(dollarStake) as totalDollarMatched, 
        AVG(dollarStake) as avgDollarBetSize,
        SUM(dollarFees) as totalDollarFees,
        SUM(unitFees) as totalUnitFees,
        NOW() as updated_at
    FROM bet_details
    GROUP BY YEAR(betDate), MONTH(betDate), sports, token
	 ) as q`;
  return knex.schema
    .dropTableIfExists("stats_time_series")
    .then(() =>
      knex.schema.createTable("stats_time_series", function (table) {
        table.increments("id").primary();
        table.integer("year").index();
        table.integer("month").index();
        table.string("sports").index();
        table.string("token").index();
        table.integer("numberOfAddresses");
        table.integer("numberOfBets");
        table.double("totalDollarMatched");
        table.double("avgDollarBetSize");
        table.double("totalDollarFees");
        table.double("totalUnitFees");
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
      })
    )
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
