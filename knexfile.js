require("dotenv").config();

// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const connections = {
  development: {
    client: "mysql2",
    connection: {
      host: "127.0.0.1",
      user: "root",
      password: process.env.DB_PASSWORD_LOCAL,
      database: "sxlab",
      charset: "utf8",
    },
  },
  production: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: "sxlab",
      charset: "utf8",
    },
  },
};

module.exports =
  process.env.NODE_ENV === "production"
    ? connections.production
    : connections.development;
