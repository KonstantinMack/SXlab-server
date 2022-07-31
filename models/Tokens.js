const Model = require("../objection");

class Tokens extends Model {
  static get tableName() {
    return "tokens";
  }

  static get idColumn() {
    return "baseToken";
  }

  static get relationMappings() {
    const Bets = require("./Bets");
    const CryptoPrices = require("./CryptoPrices");
    return {
      bets: {
        relation: Model.HasManyRelation,
        modelClass: Bets,
        join: {
          from: "tokens.baseToken",
          to: "bets.baseToken",
        },
      },
      cryptoPrices: {
        relation: Model.HasManyRelation,
        modelClass: CryptoPrices,
        join: {
          from: "tokens.baseToken",
          to: "cryptoPrices.baseToken",
        },
      },
    };
  }
}

module.exports = Tokens;
