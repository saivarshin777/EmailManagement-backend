import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import campaignRoutes from "./routes/campaignRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import "./scheduler/campaignScheduler.js";

dotenv.config();

const app = express();

console.log("Server Started");

console.log(
  "EMAIL_USER:",
  process.env.EMAIL_USER
);

console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS
    ? "Loaded"
    : "Missing"
);

console.log(
  "MONGO_URI exists:",
  !!process.env.MONGO_URI
);

app.use(cors());

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "✅ MongoDB Connected"
    );

  })
  .catch((error) => {

    console.log(
      "❌ MongoDB Connection Error:",
      error.message
    );

  });

app.use(
  "/api/campaigns",
  campaignRoutes
);

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "🚀 MailNova Backend Running"

  });

});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `🔥 Server running on port ${PORT}`
  );

});