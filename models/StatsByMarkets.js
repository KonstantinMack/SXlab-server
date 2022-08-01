const Model = require("../objection");

class StatsByMarkets extends Model {
  static get tableName() {
    return "stats_by_markets";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = StatsByMarkets;
