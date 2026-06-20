import express from "express";
import { getAnalytics, getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/", getDashboard);
router.get("/analytics", getAnalytics);

export default router;
