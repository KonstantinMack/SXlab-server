const Model = require("../objection");

class Tokens extends Model {
  static get tableName() {
    return "tokens";
  }

  static get idColumn() {
    return "baseToken";
  }
}

module.exports = Tokens;
