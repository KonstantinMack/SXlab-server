const router = require("express").Router();
const userStatsController = require("../controllers/userStatsController");

router.route("/tipsters").get(userStatsController.fetchTipsters);

module.exports = router;
