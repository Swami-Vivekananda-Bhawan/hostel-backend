const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.use(verifyToken, isAdmin);

router.get("/leaves", adminController.getAllLeaves);
router.patch("/leaves/:id/status", adminController.updateLeaveStatus);

router.get("/complaints", adminController.getAllComplaints);

router.get("/students", adminController.getAllStudents);
router.post("/students", adminController.addStudent);
router.put("/students/:id", adminController.updateStudent);
router.post("/students/bulk", adminController.bulkAddStudents);
router.patch("/complaints/:id/status", adminController.updateComplaintStatus);
router.delete("/students/:id", adminController.deleteStudent);

router.get("/profile", adminController.getAdminProfile);
router.put("/profile", adminController.updateAdminProfile);

module.exports = router;
