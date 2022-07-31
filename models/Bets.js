const Model = require("../objection");

class Bets extends Model {
  static get tableName() {
    return "bets";
  }

  static get idColumn() {
    return "_id";
  }

  static get relationMappings() {
    const Markets = require("./Markets");
    const Tokens = require("./Tokens");
    return {
      markets: {
        relation: Model.BelongsToOneRelation,
        modelClass: Markets,
        join: {
          from: "bets.marketHash",
          to: "markets.marketHash",
        },
      },
      tokens: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tokens,
        join: {
          from: "bets.baseToken",
          to: "tokens.baseToken",
        },
      },
    };
  }
}

module.exports = Bets;
