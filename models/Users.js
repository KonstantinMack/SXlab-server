const Model = require("../objection");

class Users extends Model {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "address";
  }
}

module.exports = Users;
