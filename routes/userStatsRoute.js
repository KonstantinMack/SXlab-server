const router = require("express").Router();
const userStatsController = require("../controllers/userStatsController");

router.route("/address/stats").get(userStatsController.fetchStatsByAddress);

router
  .route("/address/type-stats")
  .get(userStatsController.fetchTypeStatsByAddress);

router
  .route("/address/stats-by-date")
  .get(userStatsController.fetchStatsByDate);

router
  .route("/address/stats-by-sport")
  .get(userStatsController.fetchStatsBySport);

router
  .route("/address/stats-by-bet-time")
  .get(userStatsController.fetchStatsByBetTime);

router
  .route("/address/stats-by-odds")
  .get(userStatsController.fetchStatsByOdds);

router.route("/address/bets").get(userStatsController.fetchOpenBets);

router.route("/bet-finder/bets").get(userStatsController.fetchBetsByEvent);

router.route("/address").post(userStatsController.addUser);

module.exports = router;
