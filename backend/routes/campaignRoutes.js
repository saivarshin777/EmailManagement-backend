import express from "express";
import {
  createCampaign,
  getCampaigns,
} from "../controllers/campaignController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";
import { campaignSendLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateCampaignPayload } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", getCampaigns);
router.post(
  "/",
  protect,
  allowRoles("Admin", "Manager"),
  campaignSendLimiter,
  validateCampaignPayload,
  createCampaign
);

export default router;
