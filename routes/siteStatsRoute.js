const router = require("express").Router();
const siteStatsController = require("../controllers/siteStatsController");

router.route("/update-time").get(siteStatsController.fetchUpdateTime);

router.route("/sports").get(siteStatsController.fetchStatsBySports);

router
  .route("/token-sports")
  .get(siteStatsController.fetchStatsByTokenAndSports);

router.route("/time").get(siteStatsController.fetchStatsByTime);

router.route("/bet-type").get(siteStatsController.fetchStatsByBetType);

router.route("/markets").get(siteStatsController.fetchPopularMarkets);

module.exports = router;
