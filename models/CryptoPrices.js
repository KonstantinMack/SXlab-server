const Model = require("../objection");

class CryptoPrices extends Model {
  static get tableName() {
    return "cryptoPrices";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = CryptoPrices;
