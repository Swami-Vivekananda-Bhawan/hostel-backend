const QnA = require("../models/qna.model");

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await QnA.getAll();
    res.status(200).send(questions);
  } catch (err) {
    console.error("Error in getAllQuestions controller:", err);
    res
      .status(500)
      .send({ message: "Database error while fetching all questions." });
  }
};

exports.getUnansweredQuestions = async (req, res) => {
  try {
    const questions = await QnA.getUnanswered();
    res.status(200).send(questions);
  } catch (err) {
    console.error("Error in getUnansweredQuestions controller:", err);
    res
      .status(500)
      .send({ message: "Database error while fetching unanswered questions." });
  }
};

exports.getStudentHistory = async (req, res) => {
  try {
    const studentId = req.userId;
    const history = await QnA.getHistoryForStudent(studentId);
    res.status(200).send(history);
  } catch (err) {
    console.error("Error in getStudentHistory controller:", err);
    res
      .status(500)
      .send({ message: "Database error while fetching student history." });
  }
};

exports.markQuestionAsSeen = async (req, res) => {
  try {
    const studentId = req.userId;
    const questionId = req.params.questionId;

    const success = await QnA.markAsSeen(questionId, studentId);
    if (!success) {
      return res
        .status(404)
        .send({
          message:
            "Question not found or you are not authorized to perform this action.",
        });
    }
    res.status(200).send({ message: "Question marked as seen." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
