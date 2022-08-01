/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const ADDRESSES_INFO = `(
    SELECT 
        "All" as sports, 
        COUNT(DISTINCT bettor) as numUniqAddresses,
        NOW() as updatedAt
    FROM bet_details

    UNION ALL

    SELECT 
        sports, 
        COUNT(DISTINCT bettor) as numUniqAddresses,
        NOW() as updatedAt
    FROM bet_details
    GROUP BY sports
	 ) as q`;
  return knex.schema
    .createTable("stats_uniq_addresses", function (table) {
      table.string("sports").primary();
      table.integer("numUniqAddresses");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .then(() =>
      knex("stats_uniq_addresses").insert(
        knex.select("*").fromRaw(ADDRESSES_INFO)
      )
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stats_uniq_addresses");
};
