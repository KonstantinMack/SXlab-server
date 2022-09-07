const Model = require("../objection");

class Sports extends Model {
  static get tableName() {
    return "sports";
  }

  static get idColumn() {
    return "sportId";
  }
}

module.exports = Sports;
