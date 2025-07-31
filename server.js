require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const db = require("./src/config/db.config");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
app.use(cors(corsOptions));
const io = new Server(server, { cors: corsOptions });

app.set("socketio", io);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/leave", require("./src/routes/leave.routes"));
app.use("/api/complaints", require("./src/routes/complaint.routes"));
app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/admin", require("./src/routes/admin.routes"));
app.use("/api/qna", require("./src/routes/qna.routes"));
app.use("/api/notifications", require("./src/routes/notification.routes"));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined room ${userId}.`);
  });

  socket.on("admin:joinRoom", () => {
    socket.join("admin_room");
    console.log("An admin joined the admin room.");
  });

  socket.on("student:askQuestion", async ({ studentId, question }) => {
    try {
      const QnA = require("./src/models/qna.model");
      const newQuestionDetails = await QnA.askQuestion(studentId, question);
      io.to("admin_room").emit("admin:newQuestion", newQuestionDetails);
    } catch (error) {
      console.error("Error asking question:", error);
    }
  });

  socket.on("admin:sendAnswer", async ({ questionId, studentId, answer }) => {
    try {
      const QnA = require("./src/models/qna.model");
      await QnA.answerQuestion(questionId, answer);
      io.to(studentId.toString()).emit("student:newAnswer", {
        questionId,
        answer,
      });
    } catch (error) {
      console.error("Error sending answer:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

async function ensureAdminExists() {
  const adminEmail = "admin@hostel11.com";
  const plainPassword = "admin123";

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      adminEmail,
    ]);

    if (rows.length > 0) {
      await db.query("UPDATE users SET password = ? WHERE email = ?", [
        hashedPassword,
        adminEmail,
      ]);
      console.log('\nSUCCESS: Admin password has been reset to "admin123".\n');
    } else {
      await db.query(
        "INSERT INTO users (email, password, full_name, scholar_number, role) VALUES (?, ?, ?, ?, ?)",
        [adminEmail, hashedPassword, "Admin", "ADMIN001", "admin"]
      );
      console.log(
        '\nSUCCESS: Admin user not found. Created a new admin account with password "admin123".\n'
      );
    }
  } catch (error) {
    console.error("\n--- ERROR: Could not set up admin user ---", error, "\n");
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  await ensureAdminExists();
  console.log(`Server is running on port ${PORT}.`);
});
