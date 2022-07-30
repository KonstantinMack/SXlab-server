require("dotenv").config();

// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "127.0.0.1",
      user: "root",
      password: process.env.DB_PASSWORD,
      database: "sxlab",
      charset: "utf8",
    },
  },
};
