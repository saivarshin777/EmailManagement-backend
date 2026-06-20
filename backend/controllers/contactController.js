import Contact from "../models/Contact.js";
import ContactList from "../models/ContactList.js";
import SmsLog from "../models/SmsLog.js";
import { recordActivity } from "./activityController.js";
import { sendSms } from "../services/smsService.js";

const buildContactFilter = (search = "") => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  return filter;
};

const normalizeContactIds = (contactIds = []) =>
  [...new Set((Array.isArray(contactIds) ? contactIds : [contactIds]).filter(Boolean).map(String))];

const toClientContactList = (list) => ({
  _id: String(list._id),
  id: String(list._id),
  name: list.name,
  description: list.description || "",
  color: list.color || "#2563eb",
  contacts: list.contacts || [],
  contactCount: list.contacts?.length || 0,
  emails: (list.contacts || []).map((contact) => contact.email).filter(Boolean),
  createdAt: list.createdAt,
  updatedAt: list.updatedAt,
});

export const getContacts = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    const filter = buildContactFilter(search);

    const contacts = await Contact.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, city, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      city: city?.trim() || "",
      status: status || "Lead",
      addedBy: req.user?._id,
    });

    await recordActivity({
      action: "contact.created",
      entityType: "Contact",
      entityId: contact._id,
      actor: req.user?._id,
      message: `${contact.name} was added to contacts`,
      metadata: { email: contact.email, status: contact.status, city: contact.city },
    });

    res.status(201).json({ success: true, contact });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone, city, status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, city, status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.json({ success: true, contact });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    await ContactList.updateMany({ contacts: contact._id }, { $pull: { contacts: contact._id } });

    res.json({ success: true, message: "Contact deleted" });
  } catch (error) {
    next(error);
  }
};

export const getContactStats = async (_req, res, next) => {
  try {
    const [total, active, leads, customers] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: { $in: ["Customer", "Prospect"] } }),
      Contact.countDocuments({ status: "Lead" }),
      Contact.countDocuments({ status: "Customer" }),
    ]);

    res.json({ success: true, stats: { total, active, leads, customers } });
  } catch (error) {
    next(error);
  }
};

export const getContactLists = async (_req, res, next) => {
  try {
    const lists = await ContactList.find()
      .populate("contacts", "name email phone city status createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, lists: lists.map(toClientContactList) });
  } catch (error) {
    next(error);
  }
};

export const createContactList = async (req, res, next) => {
  try {
    const { name, description = "", color = "#2563eb", contactIds = [] } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Folder name is required" });
    }

    const list = await ContactList.create({
      name: name.trim(),
      description: description.trim(),
      color,
      contacts: normalizeContactIds(contactIds),
      createdBy: req.user?._id,
    });

    await recordActivity({
      action: "contact_list.created",
      entityType: "ContactList",
      entityId: list._id,
      actor: req.user?._id,
      message: `${list.name} contact folder was created`,
      metadata: { contactCount: list.contacts.length },
    });

    const populated = await ContactList.findById(list._id)
      .populate("contacts", "name email phone city status createdAt")
      .lean();

    res.status(201).json({ success: true, list: toClientContactList(populated) });
  } catch (error) {
    next(error);
  }
};

export const updateContactList = async (req, res, next) => {
  try {
    const { name, description, color, contactIds } = req.body;
    const update = {};

    if (name !== undefined) update.name = name.trim();
    if (description !== undefined) update.description = description.trim();
    if (color !== undefined) update.color = color;
    if (contactIds !== undefined) update.contacts = normalizeContactIds(contactIds);

    const list = await ContactList.findByIdAndUpdate(req.params.listId, update, {
      new: true,
      runValidators: true,
    })
      .populate("contacts", "name email phone city status createdAt")
      .lean();

    if (!list) {
      return res.status(404).json({ success: false, message: "Contact folder not found" });
    }

    res.json({ success: true, list: toClientContactList(list) });
  } catch (error) {
    next(error);
  }
};

export const deleteContactList = async (req, res, next) => {
  try {
    const list = await ContactList.findByIdAndDelete(req.params.listId);

    if (!list) {
      return res.status(404).json({ success: false, message: "Contact folder not found" });
    }

    res.json({ success: true, message: "Contact folder deleted" });
  } catch (error) {
    next(error);
  }
};

export const addContactsToList = async (req, res, next) => {
  try {
    const contactIds = normalizeContactIds(req.body.contactIds);

    if (contactIds.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one contact" });
    }

    const list = await ContactList.findByIdAndUpdate(
      req.params.listId,
      { $addToSet: { contacts: { $each: contactIds } } },
      { new: true }
    )
      .populate("contacts", "name email phone city status createdAt")
      .lean();

    if (!list) {
      return res.status(404).json({ success: false, message: "Contact folder not found" });
    }

    res.json({ success: true, list: toClientContactList(list) });
  } catch (error) {
    next(error);
  }
};

export const removeContactsFromList = async (req, res, next) => {
  try {
    const contactIds = normalizeContactIds(req.body.contactIds);

    const list = await ContactList.findByIdAndUpdate(
      req.params.listId,
      { $pull: { contacts: { $in: contactIds } } },
      { new: true }
    )
      .populate("contacts", "name email phone city status createdAt")
      .lean();

    if (!list) {
      return res.status(404).json({ success: false, message: "Contact folder not found" });
    }

    res.json({ success: true, list: toClientContactList(list) });
  } catch (error) {
    next(error);
  }
};

export const sendSmsToContact = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "SMS message is required" });
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    if (!contact.phone) {
      return res.status(400).json({ success: false, message: "Contact does not have a phone number" });
    }

    try {
      const result = await sendSms({ to: contact.phone, message: message.trim() });
      const log = await SmsLog.create({
        contact: contact._id,
        phone: contact.phone,
        message: message.trim(),
        status: result.mock ? "mock" : "sent",
        provider: result.provider,
        providerMessageId: result.messageId || "",
        sentBy: req.user?._id,
      });

      await recordActivity({
        action: "sms.sent",
        entityType: "Contact",
        entityId: contact._id,
        actor: req.user?._id,
        message: `SMS sent to ${contact.name}`,
        metadata: { provider: result.provider, status: log.status },
      });

      res.json({
        success: true,
        message: result.mock ? "SMS logged in mock mode. Check backend terminal." : "SMS sent successfully.",
        log,
      });
    } catch (error) {
      await SmsLog.create({
        contact: contact._id,
        phone: contact.phone,
        message: message.trim(),
        status: "failed",
        provider: process.env.SMS_PROVIDER || "mock",
        error: error.message,
        sentBy: req.user?._id,
      });

      res.status(500).json({
        success: false,
        message: "SMS failed to send.",
        detail: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const sendBulkSmsToContacts = async (req, res, next) => {
  try {
    const { message, search = "" } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "SMS message is required" });
    }

    const contacts = await Contact.find({
      ...buildContactFilter(search),
      phone: { $exists: true, $ne: "" },
    }).lean();

    if (contacts.length === 0) {
      return res.status(400).json({ success: false, message: "No contacts with phone numbers found" });
    }

    const results = [];

    for (const contact of contacts) {
      try {
        const result = await sendSms({ to: contact.phone, message: message.trim() });
        const log = await SmsLog.create({
          contact: contact._id,
          phone: contact.phone,
          message: message.trim(),
          status: result.mock ? "mock" : "sent",
          provider: result.provider,
          providerMessageId: result.messageId || "",
          sentBy: req.user?._id,
        });
        results.push({ contact: contact._id, success: true, log });
      } catch (error) {
        const log = await SmsLog.create({
          contact: contact._id,
          phone: contact.phone,
          message: message.trim(),
          status: "failed",
          provider: process.env.SMS_PROVIDER || "mock",
          error: error.message,
          sentBy: req.user?._id,
        });
        results.push({ contact: contact._id, success: false, error: error.message, log });
      }
    }

    const sent = results.filter((result) => result.success).length;
    const failed = results.length - sent;
    const firstError = results.find((result) => !result.success)?.error;

    await recordActivity({
      action: "sms.bulk_sent",
      entityType: "Contact",
      actor: req.user?._id,
      message: `Bulk SMS completed for ${results.length} contacts`,
      metadata: { sent, failed, search },
    });

    res.json({
      success: failed === 0,
      message: firstError
        ? `SMS complete: ${sent} sent, ${failed} failed. Reason: ${firstError}`
        : `SMS complete: ${sent} sent, ${failed} failed.`,
      sent,
      failed,
      total: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
};
