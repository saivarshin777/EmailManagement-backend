import express from "express";

import {
  getAnalytics,
  getChartData
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get(
  "/",
  getAnalytics
);

router.get(
  "/charts",
  getChartData
);

export default router;