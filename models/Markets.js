const Model = require("../objection");

class Markets extends Model {
  static get tableName() {
    return "markets";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Markets;
