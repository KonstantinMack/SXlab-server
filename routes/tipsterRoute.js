const router = require("express").Router();
const tipsterController = require("../controllers/tipsterController");

router.route("/tipsters").get(tipsterController.fetchTipsters);

router.route("/favourites").get(tipsterController.fetchFavourites);

router.route("/star").post(tipsterController.starTipster);
router.route("/unstar").delete(tipsterController.unstarTipster);

module.exports = router;
