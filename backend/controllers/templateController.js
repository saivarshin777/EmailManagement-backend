import Template from "../models/Template.js";

const starterTemplates = [
  {
    name: "Product Launch",
    subject: "Meet our newest launch",
    templateType: "Launch",
    background: "#eef2ff",
    accentColor: "#2563eb",
    htmlContent:
      "<h1>New launch is live</h1><p>{{content}}</p><p>Explore what is new and tell us what you think.</p><a href=\"#\">View launch</a>",
    textContent: "New launch is live\n\n{{content}}\n\nExplore what is new and tell us what you think.",
  },
  {
    name: "Festive Offer",
    subject: "A special offer for you",
    templateType: "Offer",
    background: "#fff7ed",
    accentColor: "#f97316",
    htmlContent:
      "<h1>Limited-time offer</h1><p>{{content}}</p><p>Use this campaign to highlight discounts, bundles, and urgency.</p><a href=\"#\">Shop now</a>",
    textContent: "Limited-time offer\n\n{{content}}\n\nUse this campaign to highlight discounts, bundles, and urgency.",
  },
  {
    name: "Newsletter",
    subject: "Latest updates from Mail Nova",
    templateType: "Newsletter",
    background: "#ecfdf5",
    accentColor: "#16a34a",
    htmlContent:
      "<h1>This week's updates</h1><p>{{content}}</p><p>Share product notes, stories, and useful links with your audience.</p>",
    textContent: "This week's updates\n\n{{content}}\n\nShare product notes, stories, and useful links with your audience.",
  },
];

const seedTemplatesIfNeeded = async () => {
  const count = await Template.countDocuments();
  if (count === 0) {
    await Template.insertMany(starterTemplates);
  }
};

export const getTemplates = async (_req, res, next) => {
  try {
    await seedTemplatesIfNeeded();
    const templates = await Template.find().sort({ updatedAt: -1 }).lean();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id).lean();
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const template = await Template.create({
      name: req.body.name?.trim() || "Untitled Template",
      subject: req.body.subject?.trim() || "",
      templateType: req.body.templateType?.trim() || "Custom",
      background: req.body.background || "#f8fafc",
      accentColor: req.body.accentColor || "#2563eb",
      customLogo: req.body.customLogo || "",
      blocks: Array.isArray(req.body.blocks) ? req.body.blocks : [],
      htmlContent: req.body.htmlContent || req.body.html || "",
      textContent: req.body.textContent || "",
    });
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name?.trim() || "Untitled Template",
        subject: req.body.subject?.trim() || "",
        templateType: req.body.templateType?.trim() || "Custom",
        background: req.body.background || "#f8fafc",
        accentColor: req.body.accentColor || "#2563eb",
        customLogo: req.body.customLogo || "",
        blocks: Array.isArray(req.body.blocks) ? req.body.blocks : [],
        htmlContent: req.body.htmlContent || req.body.html || "",
        textContent: req.body.textContent || "",
      },
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    next(error);
  }
};
