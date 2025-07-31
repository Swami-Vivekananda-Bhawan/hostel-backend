const Leave = require("../models/leave.model");
const User = require("../models/user.model");

exports.create = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).send({ message: "User not found." });

    const leaveRequest = {
      student_id: req.userId,
      student_name: user.full_name,
      scholar_number: user.scholar_number,
      mobile_number: req.body.mobileNumber,
      room_number: req.body.roomNumber,
      start_date: req.body.startDate,
      end_date: req.body.endDate,
      reason: req.body.reason,
      address: req.body.address,
    };
    await Leave.create(leaveRequest);
    res.status(201).send({ message: "Leave request submitted successfully!" });
  } catch (err) {
    console.error("ERROR in leave.controller:", err);
    res
      .status(500)
      .send({ message: "Server error while creating leave request." });
  }
};
