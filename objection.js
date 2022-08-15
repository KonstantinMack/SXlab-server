const Knex = require("knex");
const knex = Knex(require("./knexfile"));
const { Model } = require("objection");

Model.knex(knex);

module.exports = Model;
