const Model = require("../objection");

class StatsTimeSeries extends Model {
  static get tableName() {
    return "stats_time_series";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = StatsTimeSeries;
