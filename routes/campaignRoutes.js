import express from "express";

import {
  createCampaign,
  sendCampaign,
  getCampaigns,
  getAllCampaigns,
  searchCampaigns,
  getCampaignHistory,
  trackOpen,
  trackClick
} from "../controllers/campaignController.js";

const router = express.Router();

router.post(
  "/create",
  createCampaign
);

router.post(
  "/send/:id",
  sendCampaign
);

router.get(
  "/",
  getCampaigns
);

router.get(
  "/all",
  getAllCampaigns
);

router.get(
  "/search",
  searchCampaigns
);

router.get(
  "/history",
  getCampaignHistory
);

router.get(
  "/track/open/:id",
  trackOpen
);

router.get(
  "/track/click/:id",
  trackClick
);

export default router;