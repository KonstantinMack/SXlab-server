const Model = require("../objection");

class Telegram extends Model {
  static get tableName() {
    return "telegram";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Telegram;
