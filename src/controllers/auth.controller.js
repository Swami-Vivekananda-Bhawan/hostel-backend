const { OAuth2Client } = require("google-auth-library");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const otpGenerator = require("otp-generator");
const otpStorage = new Map();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(404)
        .send({ message: "User with this email does not exist." });
    }
    if (!user.mobile_number) {
      return res
        .status(400)
        .send({
          message:
            "No mobile number is registered for this account. Please contact admin.",
        });
    }

    // Generate a 4-digit OTP
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const expiry = Date.now() + 300000; // OTP is valid for 5 minutes

    otpStorage.set(email, { otp, expiry });

    // --- SIMULATING SENDING SMS ---
    console.log("\n--- PASSWORD RESET OTP ---");
    console.log(`OTP for ${email} (Mobile: ${user.mobile_number}) is: ${otp}`);
    console.log("This OTP will expire in 5 minutes.");
    console.log("--------------------------\n");

    res
      .status(200)
      .send({
        message: "Verification code has been sent (check backend console).",
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// NEW: Function to verify OTP and reset the password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const storedOtpData = otpStorage.get(email);

    if (!storedOtpData) {
      return res
        .status(400)
        .send({ message: "Invalid request or OTP expired. Please try again." });
    }
    if (Date.now() > storedOtpData.expiry) {
      otpStorage.delete(email);
      return res
        .status(400)
        .send({ message: "OTP has expired. Please request a new one." });
    }
    if (storedOtpData.otp !== otp) {
      return res.status(400).send({ message: "Invalid verification code." });
    }

    const user = await User.findByEmail(email);
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await User.updatePasswordById(user.id, hashedPassword);

    otpStorage.delete(email); // OTP has been used, so delete it

    res
      .status(200)
      .send({
        message: "Password has been reset successfully. You can now log in.",
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// UPDATED: Google Sign-In now only logs in existing users
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email } = payload;
    let user = await User.findByEmail(email);

    if (!user) {
      return res
        .status(404)
        .send({
          message:
            "Account not found. Please contact the admin to create your account.",
        });
    }

    // If user exists, create a token and log them in
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      scholar_number: user.scholar_number,
      role: user.role,
      accessToken: token,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).send({ message: "Could not log in with Google." });
  }
};

// Standard login for admin (remains the same)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || !user.password) {
      return res
        .status(404)
        .send({ message: "User not found or is a Google-only user." });
    }
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: 86400,
    });
    res.status(200).send({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      scholar_number: user.scholar_number,
      role: user.role,
      accessToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// NEW: Function for students to create their account
exports.createAccount = async (req, res) => {
  try {
    const { scholarNumber, email, password } = req.body;

    // Find the student record added by the admin
    const studentRecord = await User.findByScholarNumber(scholarNumber);

    if (!studentRecord) {
      return res
        .status(404)
        .send({
          message:
            "Scholar number not found in hostel records. Please contact admin.",
        });
    }

    // Check if the account is already set up (i.e., has a password)
    if (studentRecord.password) {
      return res
        .status(400)
        .send({
          message:
            "This account has already been set up. Please go to the login page.",
        });
    }

    // Check if the new email is already in use by another account
    const emailExists = await User.findByEmail(email);
    if (emailExists) {
      return res
        .status(400)
        .send({ message: "This email address is already in use." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await User.updateAccountSetup(studentRecord.id, email, hashedPassword);

    res
      .status(200)
      .send({ message: "Account created successfully! You can now log in." });
  } catch (err) {
    res
      .status(500)
      .send({ message: err.message || "Could not create account." });
  }
};

exports.setupAccount = async (req, res) => {
  try {
    const { scholarNumber, email, password } = req.body;
    const studentRecord = await User.findByScholarNumber(scholarNumber);

    if (!studentRecord) {
      return res
        .status(404)
        .send({
          message:
            "Scholar number not found in hostel records. Please contact admin.",
        });
    }
    if (studentRecord.password) {
      return res
        .status(400)
        .send({
          message:
            "This account has already been set up. Please go to the login page.",
        });
    }
    if (await User.findByEmail(email)) {
      return res
        .status(400)
        .send({ message: "This email address is already in use." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await User.setupAccount(studentRecord.id, email, hashedPassword);

    res
      .status(200)
      .send({ message: "Account created successfully! You can now log in." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
