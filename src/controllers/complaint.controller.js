const Complaint = require("../models/complaint.model");
const User = require("../models/user.model");

exports.create = async (req, res) => {
    console.log("--- [BACKEND LOG] Complaint submission request received ---");
    try {
        console.log("[BACKEND LOG 1] Finding user by ID:", req.userId);
        const user = await User.findById(req.userId);
        if (!user) {
            console.error("[BACKEND ERROR] User not found for ID:", req.userId);
            return res.status(404).send({ message: "User not found." });
        }
        console.log("[BACKEND LOG 2] User found:", user.full_name);

        const complaint = {
            student_id: req.userId,
            student_name: user.full_name,
            scholar_number: user.scholar_number,
            room_number: req.body['room-number'],
            mobile_number: req.body['mobile-number'],
            category: req.body.category,
            message: req.body.message,
            media_path: req.file ? req.file.path : null,
        };
        console.log("[BACKEND LOG 3] Complaint data prepared:", complaint);

        await Complaint.create(complaint);
        console.log("[BACKEND LOG 4] Complaint saved to database successfully.");
        res.status(201).send({ message: "Complaint submitted successfully!" });
    } catch (err) {
        console.error("--- [BACKEND FATAL ERROR] in complaint.controller ---", err);
        res.status(500).send({ message: "Server error while creating complaint. Check logs." });
    }
};