const Model = require("../objection");

class StatsBySports extends Model {
  static get tableName() {
    return "stats_by_sports";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = StatsBySports;
