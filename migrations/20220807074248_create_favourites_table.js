/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.dropTableIfExists("favourites").then(() =>
    knex.schema.createTable("favourites", function (table) {
      table.increments("id").primary();
      table.string("address").index();
      table.string("bettor");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("favourites");
};
