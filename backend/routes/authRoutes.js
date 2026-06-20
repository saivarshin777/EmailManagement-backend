import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import OTP from "../models/OTP.js";
import User from "../models/User.js";

const router = express.Router();
let transporter;

const getEmailConfig = () => ({
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
  port: Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587),
  secure:
    process.env.SMTP_SECURE === "true" ||
    process.env.EMAIL_SECURE === "true" ||
    String(process.env.SMTP_PORT || process.env.EMAIL_PORT) === "465",
  user: process.env.SMTP_USER || process.env.EMAIL_USER,
  pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  from: process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER,
});

const getTransporter = () => {
  const config = getEmailConfig();

  if (!config.host || !config.user || !config.pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
};

const sendEmail = async ({ email, subject, message, html }) => {
  const transport = getTransporter();
  const config = getEmailConfig();

  if (!transport) {
    console.log(`\nMOCK EMAIL\nTo: ${email}\nSubject: ${subject}\n${message}\n`);
    return { mock: true };
  }

  await transport.sendMail({
    from: config.from || config.user,
    to: email,
    subject,
    text: message,
    html,
  });

  return { mock: false };
};

const buildOtpHtml = (otp, heading, subheading) => `
  <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;max-width:480px;margin:0 auto;background:#fff;">
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#ea580c;margin:0;font-size:24px;font-weight:bold;">MailNova</h2>
      <p style="color:#6b7280;font-size:14px;margin:5px 0 0 0;">${subheading}</p>
    </div>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0;" />
    <p style="font-size:15px;color:#4b5563;line-height:1.5;">${heading}</p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:28px;font-weight:bold;letter-spacing:5px;text-align:center;padding:15px;margin:25px 0;color:#ea580c;">
      ${otp}
    </div>
    <p style="font-size:13px;color:#9ca3af;line-height:1.4;">This code expires in <strong>5 minutes</strong>. If you did not request this, please ignore.</p>
    <hr style="border:0;border-top:1px solid #e5e7eb;margin:25px 0;" />
    <p style="font-size:11px;color:#9ca3af;text-align:center;margin:0;">Automated security email - do not reply.</p>
  </div>
`;

const createOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.deleteMany({ email });
  await OTP.create({ email, otp });
  return otp;
};

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({ success: false, message: "An account with that email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, message: "Registration successful! You can now log in." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "An account with that email already exists" });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter email and password" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const otp = await createOtp(user.email);
    const subject = "MailNova - Your Login Verification Code";
    const message = `Your 6-digit verification code is: ${otp}. It is valid for 5 minutes.`;
    const html = buildOtpHtml(otp, "To complete your login, use the security code below:", "Two-Step Verification");

    try {
      const result = await sendEmail({ email: user.email, subject, message, html });
      return res.json({
        success: true,
        message: result.mock
          ? "OTP generated and printed to server terminal."
          : "OTP sent to your email. Please verify.",
      });
    } catch (error) {
      await OTP.deleteMany({ email: user.email });
      return res.status(500).json({
        success: false,
        message: "Could not send OTP email. Check SMTP settings in your .env file.",
        detail: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await OTP.findOne({ email: normalizedEmail, otp: otp.trim() });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP. Please request a new one." });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found" });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "mailnova-dev-secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/resend-otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with that email" });
    }

    const otp = await createOtp(user.email);
    const subject = "MailNova - New Verification Code";
    const message = `Your new verification code is: ${otp}. It is valid for 5 minutes.`;
    const html = buildOtpHtml(otp, "You requested a new code. Use it to complete your login:", "New Verification Code");

    try {
      const result = await sendEmail({ email: user.email, subject, message, html });
      return res.json({
        success: true,
        message: result.mock
          ? "New OTP generated and printed to server terminal."
          : "New OTP sent to your email.",
      });
    } catch (error) {
      await OTP.deleteMany({ email: user.email });
      return res.status(500).json({
        success: false,
        message: "Could not resend OTP. Check your SMTP settings.",
        detail: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide your email" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ success: true, message: "If that email is registered, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
    const subject = "MailNova - Password Reset Request";
    const message = `Reset your password here: ${resetUrl}\n\nThis link expires in 30 minutes.`;
    const html = `
      <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;max-width:480px;margin:0 auto;background:#fff;">
        <h2 style="color:#ea580c;text-align:center;">MailNova Password Reset</h2>
        <p style="color:#4b5563;">Click the button below to set a new password. This link expires in <strong>30 minutes</strong>.</p>
        <div style="text-align:center;margin:25px 0;">
          <a href="${resetUrl}" style="background:#ea580c;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;font-size:15px;display:inline-block;">Reset Password</a>
        </div>
        <p style="font-size:13px;color:#6b7280;">If the button does not work, copy this link:<br/><span style="word-break:break-all;color:#2563eb;">${resetUrl}</span></p>
      </div>
    `;

    try {
      const result = await sendEmail({ email: user.email, subject, message, html });
      if (result.mock) console.log(`Password reset URL: ${resetUrl}`);
      return res.json({
        success: true,
        message: result.mock
          ? "Reset link generated and printed to server terminal."
          : "Password reset link sent to your email.",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Could not send reset email. Check your SMTP settings.",
        detail: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a new password" });
    }

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
});

export default router;
