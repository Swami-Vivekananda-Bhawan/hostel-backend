const db = require("../config/db.config"); // YEH LINE ZAROORI HAI
const Leave = require("../models/leave.model");
const Complaint = require("../models/complaint.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.getAllLeaves = async (req, res) => {
  try {
    const [leaves] = await db.query(
      "SELECT * FROM leave_requests ORDER BY created_at DESC"
    );
    res.status(200).send(leaves);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { id } = req.params;
    const { status } = req.body;
    const updatedLeave = await Leave.updateStatusById(id, status);
    if (!updatedLeave)
      return res.status(404).send({ message: "Leave request not found." });

    const message = `Your leave request from ${new Date(
      updatedLeave.start_date
    ).toLocaleDateString()} has been ${status}.`;
    await Notification.create(updatedLeave.student_id, message);
    io.to(updatedLeave.student_id.toString()).emit("new_notification", {
      message,
    });

    res.status(200).send({ message: "Leave status updated successfully." });
  } catch (err) {
    console.error("Error updating leave status:", err);
    res.status(500).send({ message: "Could not update leave status." });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const [complaints] = await db.query(
      "SELECT * FROM complaints ORDER BY created_at DESC"
    );
    res.status(200).send(complaints);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    const { id } = req.params;
    const { status } = req.body;
    const updatedComplaint = await Complaint.updateStatusById(id, status);
    if (!updatedComplaint)
      return res.status(404).send({ message: "Complaint not found." });

    const message = `Your complaint regarding "${updatedComplaint.category}" has been ${status}.`;
    await Notification.create(updatedComplaint.student_id, message);
    io.to(updatedComplaint.student_id.toString()).emit("new_notification", {
      message,
    });

    res.status(200).send({ message: "Complaint status updated successfully." });
  } catch (err) {
    console.error("Error updating complaint status:", err);
    res.status(500).send({ message: "Could not update complaint status." });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.getAllStudents();
    res.status(200).send(students);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { fullName, scholarNumber, mobileNumber, roomNumber } = req.body;
    if (await User.findByScholarNumber(scholarNumber)) {
      return res
        .status(400)
        .send({ message: "Failed! Scholar number already exists!" });
    }
    const newUser = {
      full_name: fullName,
      scholar_number: scholarNumber,
      mobile_number: mobileNumber,
      room_number: roomNumber,
      role: "student",
    };
    await User.create(newUser);
    res
      .status(201)
      .send({
        message:
          "Student record created successfully! They can now set up their account.",
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, scholarNumber, email, mobileNumber, roomNumber } =
      req.body;
    const studentData = {
      full_name: fullName,
      scholar_number: scholarNumber,
      email,
      mobile_number: mobileNumber,
      room_number: roomNumber,
    };
    const updatedStudent = await User.updateById(id, studentData);
    if (!updatedStudent)
      return res
        .status(404)
        .send({ message: `Student with id=${id} not found.` });
    res.status(200).send({ message: "Student details updated successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).send({ message: "Email is already in use." });
    res
      .status(500)
      .send({ message: err.message || "Could not update student details." });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.removeById(id);
    if (!result)
      return res
        .status(404)
        .send({ message: `Student with id=${id} not found.` });
    res.status(200).send({ message: "Student removed successfully." });
  } catch (err) {
    res
      .status(500)
      .send({ message: err.message || "Could not remove student." });
  }
};

exports.bulkAddStudents = async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students) || students.length === 0)
      return res.status(400).send({ message: "No student data provided." });

    const validStudents = students.filter(
      (s) => s.full_name && s.scholar_number
    );
    if (validStudents.length === 0)
      return res
        .status(400)
        .send({
          message:
            "No valid rows found. Ensure Name and Scholar Number are present.",
        });

    const result = await User.bulkCreate(validStudents);
    res
      .status(201)
      .send({
        message: `Bulk operation complete. Added: ${
          result.success
        }. Skipped duplicates: ${students.length - result.success}.`,
      });
  } catch (err) {
    console.error("BULK ADD ERROR:", err);
    res
      .status(500)
      .send({
        message: "An error occurred during bulk add. Please check server logs.",
      });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.userId);
    if (!admin) {
      return res.status(404).send({ message: "Admin not found." });
    }

    res.status(200).send({ email: admin.email, fullName: admin.full_name });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email cannot be empty." });
    }

    const profileData = { email: email };

    if (password) {
      profileData.password = bcrypt.hashSync(password, 10);
    }

    const success = await User.updateAdminProfile(adminId, profileData);

    if (!success) {
      return res
        .status(404)
        .send({ message: "Admin profile not found or no changes were made." });
    }

    res
      .status(200)
      .send({
        message:
          "Profile updated successfully. Please log in again to see changes.",
      });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).send({ message: "This email is already in use." });
    }
    res
      .status(500)
      .send({ message: err.message || "Could not update profile." });
  }
};
