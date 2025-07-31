const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaint.controller");
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/auth.middleware");

router.post(
  "/",
  verifyToken,
  upload.single("media"),
  complaintController.create
);

module.exports = router;
