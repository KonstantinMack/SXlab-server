const Model = require("../objection");

class StatsTipsters extends Model {
  static get tableName() {
    return "stats_tipsters";
  }

  static get idColumn() {
    return "bettor";
  }
}

module.exports = StatsTipsters;
