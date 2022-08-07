const Model = require("../objection");

class Favourites extends Model {
  static get tableName() {
    return "favourites";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = Favourites;
