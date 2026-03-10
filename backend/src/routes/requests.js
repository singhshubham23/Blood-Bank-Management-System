// routes/requests.js
const express = require("express");
const router = express.Router();
const { ensureAuth, ensureRole } = require("../middleware/auth");
const requestController = require("../controllers/requestController");

router.post("/", ensureAuth, requestController.createRequest);
router.get("/my", ensureAuth, requestController.getMyRequests);
// admin OR organisations/hospitals see filtered lists
router.get("/", ensureAuth, ensureRole(["admin", "organisation", "hospital"]), requestController.getAllRequests);
router.patch("/:id/process", ensureAuth, ensureRole(["admin", "organisation", "hospital"]), requestController.processRequest);

module.exports = router;
