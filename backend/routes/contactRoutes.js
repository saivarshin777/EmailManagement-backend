import express from "express";
import {
  addContactsToList,
  createContact,
  createContactList,
  deleteContact,
  deleteContactList,
  getContacts,
  getContactLists,
  getContactStats,
  removeContactsFromList,
  sendBulkSmsToContacts,
  sendSmsToContact,
  updateContact,
  updateContactList,
} from "../controllers/contactController.js";
import { allowRoles, protect } from "../middleware/authMiddleware.js";
import { smsSendLimiter } from "../middleware/rateLimitMiddleware.js";
import { validateContactPayload } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getContactStats);
router.get("/lists", getContactLists);
router.post("/lists", allowRoles("Admin", "Manager"), createContactList);
router.put("/lists/:listId", allowRoles("Admin", "Manager"), updateContactList);
router.delete("/lists/:listId", allowRoles("Admin", "Manager"), deleteContactList);
router.post("/lists/:listId/contacts", allowRoles("Admin", "Manager"), addContactsToList);
router.delete("/lists/:listId/contacts", allowRoles("Admin", "Manager"), removeContactsFromList);
router.post("/sms", allowRoles("Admin", "Manager"), smsSendLimiter, sendBulkSmsToContacts);
router.get("/", getContacts);
router.post("/", allowRoles("Admin", "Manager"), validateContactPayload, createContact);
router.post("/:id/sms", allowRoles("Admin", "Manager"), smsSendLimiter, sendSmsToContact);
router.put("/:id", allowRoles("Admin", "Manager"), validateContactPayload, updateContact);
router.delete("/:id", allowRoles("Admin", "Manager"), deleteContact);

export default router;
