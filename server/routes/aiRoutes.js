const express = require("express");
const { suggestTask } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { suggestValidator } = require("../validators/aiValidators");

const router = express.Router();

router.post("/suggest", protect, suggestValidator, validateRequest, suggestTask);

module.exports = router;
