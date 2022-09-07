/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("sports", (table) => {
      table.integer("sportId").primary();
      table.string("label").notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .createTable("leagues", (table) => {
      table.integer("leagueId").primary();
      table.string("label").notNullable();
      table.integer("sportId").notNullable().index();
      table.boolean("active");
      table.boolean("homeTeamFirst");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .createTable("markets", (table) => {
      table.string("status");
      table.string("marketHash").primary();
      table.string("teamOneName");
      table.string("teamTwoName");
      table.string("outcomeOneName");
      table.string("outcomeTwoName");
      table.string("outcomeVoidName");
      table.integer("participantOneId");
      table.integer("participantTwoId");
      table.string("type");
      table.integer("gameTime").unsigned();
      table.integer("reportedDate").unsigned();
      table.integer("outcome");
      table.string("teamOneScore");
      table.string("teamTwoScore");
      table.string("sportXeventId");
      table.string("sportLabel");
      table.integer("sportId").index();
      table.integer("leagueId").index();
      table.boolean("homeTeamFirst");
      table.string("leagueLabel");
      table.string("group1");
      table.string("line");
      table.string("group2");
      table.string("liveEnabled");
      table.string("marketMeta");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .createTable("tokens", (table) => {
      table.string("baseToken").primary();
      table.string("token").notNullable();
      table.integer("decimals").notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .createTable("crypto_prices", (table) => {
      table.increments("id").primary();
      table.string("baseToken").index();
      table.string("crypto");
      table.double("price").notNullable();
      table.string("date").notNullable();
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .createTable("bets", (table) => {
      table.string("_id").primary();
      table.string("baseToken").index();
      table.string("bettor").notNullable().index();
      table.double("stake", 30, 0).notNullable();
      table.double("odds", 30, 0).notNullable();
      table.string("orderHash");
      table.string("marketHash").index();
      table.boolean("maker");
      table.integer("betTime");
      table.boolean("settled").notNullable();
      table.double("settleValue");
      table.boolean("bettingOutcomeOne").notNullable();
      table.string("fillHash");
      table.string("tradeStatus");
      table.boolean("valid");
      table.integer("outcome");
      table.string("settleDate");
      table.string("date");
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("bets")
    .dropTableIfExists("markets")
    .dropTableIfExists("leagues")
    .dropTableIfExists("sports")
    .dropTableIfExists("crypto_prices")
    .dropTableIfExists("tokens");
};
