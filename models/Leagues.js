const Model = require("../objection");

class Leagues extends Model {
  static get tableName() {
    return "leagues";
  }

  static get idColumn() {
    return "leagueId";
  }

  static get relationMappings() {
    const Sports = require("./Sports");
    const Markets = require("./Markets");
    return {
      sports: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sports,
        join: {
          from: "leagues.sportId",
          to: "sports.sportId",
        },
      },
      markets: {
        relation: Model.HasManyRelation,
        modelClass: Markets,
        join: {
          from: "leagues.leagueId",
          to: "markets.leagueId",
        },
      },
    };
  }
}

module.exports = Leagues;
