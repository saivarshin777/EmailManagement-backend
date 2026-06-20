import express from "express";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  getTemplates,
  updateTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

router.get("/", getTemplates);
router.post("/", createTemplate);
router.get("/:id", getTemplate);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);

export default router;
