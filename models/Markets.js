const Model = require("../objection");

class Markets extends Model {
  static get tableName() {
    return "markets";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {
    const Sports = require("./Sports");
    const Leagues = require("./Leagues");
    const Bets = require("./Bets");
    return {
      sports: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sports,
        join: {
          from: "markets.sportId",
          to: "sports.sportId",
        },
      },
      leagues: {
        relation: Model.BelongsToOneRelation,
        modelClass: Leagues,
        join: {
          from: "markets.leagueId",
          to: "leagues.leagueId",
        },
      },
      bets: {
        relation: Model.HasManyRelation,
        modelClass: Bets,
        join: {
          from: "markets.marketHash",
          to: "bets.marketHash",
        },
      },
    };
  }
}

module.exports = Markets;
