const Model = require("../objection");

class Bets extends Model {
  static get tableName() {
    return "bets";
  }

  static get idColumn() {
    return "_id";
  }
}

module.exports = Bets;
