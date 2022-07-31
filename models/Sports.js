const Model = require("../objection");

class Sports extends Model {
  static get tableName() {
    return "sports";
  }

  static get idColumn() {
    return "sportId";
  }

  static get relationMappings() {
    const Leagues = require("./Leagues");
    const Markets = require("./Markets");
    return {
      leagues: {
        relation: Model.HasManyRelation,
        modelClass: Leagues,
        join: {
          from: "sports.sportId",
          to: "leagues.sportId",
        },
      },
      markets: {
        relation: Model.HasManyRelation,
        modelClass: Markets,
        join: {
          from: "sports.sportId",
          to: "markets.sportId",
        },
      },
    };
  }
}

module.exports = Sports;
