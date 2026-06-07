import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log("SMTP User:", process.env.EMAIL_USER);
console.log(
  "SMTP Pass Length:",
  process.env.EMAIL_PASS?.length
);

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }

  });

transporter.verify((error) => {

  if (error) {

    console.log(
      "❌ SMTP Verify Error:",
      error
    );

  } else {

    console.log(
      "✅ SMTP Server Ready"
    );

  }

});

export default transporter;