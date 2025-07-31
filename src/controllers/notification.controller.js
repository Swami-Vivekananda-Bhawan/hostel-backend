const Notification = require("../models/notification.model");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getUnreadByUserId(req.userId);
    res.status(200).send(notifications);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.markAsReadByUserId(req.userId);
    res.status(200).send({ message: "Notifications marked as read." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
