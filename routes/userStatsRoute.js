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

router.route("/address/bets").get(userStatsController.fetchOpenBets);

router.route("/address").post(userStatsController.addUser);

module.exports = router;
