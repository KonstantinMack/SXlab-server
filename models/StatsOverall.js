const Model = require("../objection");

class StatsOverall extends Model {
  static get tableName() {
    return "stats_overall";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = StatsOverall;
