const express = require("express");
const router = express.Router();
const qnaController = require("../controllers/qna.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");

router.get("/all", [verifyToken, isAdmin], qnaController.getAllQuestions);

router.get(
  "/unanswered",
  [verifyToken, isAdmin],
  qnaController.getUnansweredQuestions
);

router.get("/history", [verifyToken], qnaController.getStudentHistory);

router.patch(
  "/:questionId/seen",
  [verifyToken],
  qnaController.markQuestionAsSeen
);

module.exports = router;
