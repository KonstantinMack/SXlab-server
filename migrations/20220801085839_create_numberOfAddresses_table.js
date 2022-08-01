/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const ADDRESSES_INFO = `(
    SELECT 
        NULL as id,
        "All" as sports, 
        COUNT(DISTINCT bettor) as numUniqAddresses,
        NOW() as updatedAt
    FROM bet_details

    UNION ALL

    SELECT 
        NULL as id,
        sports, 
        COUNT(DISTINCT bettor) as numUniqAddresses,
        NOW() as updatedAt
    FROM bet_details
    GROUP BY sports
	 ) as q`;
  return knex.schema
    .dropTableIfExists("stats_uniq_addresses")
    .then(() =>
      knex.schema.createTable("stats_uniq_addresses", function (table) {
        table.increments("id").primary();
        table.string("sports");
        table.integer("numUniqAddresses");
        table.timestamp("updatedAt").defaultTo(knex.fn.now());
      })
    )
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
