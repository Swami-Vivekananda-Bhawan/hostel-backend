const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.use(verifyToken);
router.get("/", notificationController.getNotifications);
router.patch("/read", notificationController.markAsRead);

module.exports = router;
