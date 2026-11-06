const router = require("express").Router();
const protectAdmin = require("../middleware/auth");
const controller = require("../controllers/applicationController");

router.post("/", controller.createApplication);
router.get("/", protectAdmin, controller.getApplications);
router.get("/statistics", protectAdmin, controller.getStatistics);
router.patch("/:id/status", protectAdmin, controller.updateApplicationStatus);
router.delete("/:id", protectAdmin, controller.deleteApplication);

module.exports = router;
