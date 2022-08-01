const Model = require("../objection");

class StatsUniqAddresses extends Model {
  static get tableName() {
    return "stats_uniq_addresses";
  }

  static get idColumn() {
    return "id";
  }
}

module.exports = StatsUniqAddresses;
