const Model = require("../objection");

class CryptoPrices extends Model {
  static get tableName() {
    return "cryptoPrices";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const Tokens = require("./Tokens");
    return {
      tokens: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tokens,
        join: {
          from: "cryptoPrices.baseToken",
          to: "tokens.baseToken",
        },
      },
    };
  }
}

module.exports = CryptoPrices;
