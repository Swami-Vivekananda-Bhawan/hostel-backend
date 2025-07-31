const db = require("../config/db.config");

const QnA = {};

QnA.getAll = async () => {
  const [rows] = await db.query(
    `SELECT qna.*, users.full_name, users.scholar_number 
     FROM qna 
     JOIN users ON qna.student_id = users.id
     ORDER BY qna.question_timestamp DESC`
  );
  return rows;
};

QnA.getUnanswered = async () => {
  const [rows] = await db.query(
    `SELECT qna.*, users.full_name, users.scholar_number 
     FROM qna 
     JOIN users ON qna.student_id = users.id
     WHERE qna.status = 'unanswered'
     ORDER BY qna.question_timestamp ASC`
  );
  return rows;
};

QnA.getHistoryForStudent = async (studentId) => {
  const [rows] = await db.query(
    `SELECT * FROM qna WHERE student_id = ? AND is_seen_by_student = 0 ORDER BY question_timestamp DESC`,
    [studentId]
  );
  return rows;
};

QnA.markAsSeen = async (questionId, studentId) => {
  const [result] = await db.query(
    "UPDATE qna SET is_seen_by_student = 1 WHERE id = ? AND student_id = ?",
    [questionId, studentId]
  );
  return result.affectedRows > 0;
};

QnA.askQuestion = async (studentId, question) => {
  const [result] = await db.query(
    "INSERT INTO qna (student_id, question, status) VALUES (?, ?, 'unanswered')",
    [studentId, question]
  );
  const [newQuestion] = await db.query(
    `SELECT qna.*, users.full_name, users.scholar_number 
     FROM qna 
     JOIN users ON qna.student_id = users.id
     WHERE qna.id = ?`,
    [result.insertId]
  );
  return newQuestion[0];
};

QnA.answerQuestion = async (questionId, answer) => {
  const [result] = await db.query(
    "UPDATE qna SET answer = ?, status = 'answered', answer_timestamp = NOW() WHERE id = ?",
    [answer, questionId]
  );
  return { id: questionId, answer };
};

module.exports = QnA;
