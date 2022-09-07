const Model = require("../objection");

class UpdateTime extends Model {
  static get tableName() {
    return "update_time";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = UpdateTime;
