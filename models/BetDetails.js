const Model = require("../objection");

class BetDetails extends Model {
  static get tableName() {
    return "bet_details";
  }

  static get idColumn() {
    return "_id";
  }
}

module.exports = BetDetails;
