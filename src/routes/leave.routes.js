const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
const { verifyToken } = require("../middleware/auth.middleware"); // Import middleware

// UPDATED: Added verifyToken middleware to protect the route
router.post("/", verifyToken, leaveController.create);

module.exports = router;
