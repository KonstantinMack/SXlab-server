const Model = require("../objection");

class Leagues extends Model {
  static get tableName() {
    return "leagues";
  }

  static get idColumn() {
    return "leagueId";
  }
}

module.exports = Leagues;
