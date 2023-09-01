const router = require("express").Router();
const tipsterController = require("../controllers/tipsterController");

router.route("/tipsters").get(tipsterController.fetchTipsters);

router.route("/favourites").get(tipsterController.fetchFavourites);

router.route("/star").post(tipsterController.starTipster);
router.route("/unstar").delete(tipsterController.unstarTipster);

router.route("/is-subbed").get(tipsterController.isTgSubbed);
router.route("/unsub").delete(tipsterController.unsubTg);

module.exports = router;
