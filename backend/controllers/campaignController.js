import Campaign from "../models/Campaign.js";
import ContactList from "../models/ContactList.js";
import EmailLog from "../models/EmailLog.js";
import Notification from "../models/Notification.js";
import Template from "../models/Template.js";
import { recordActivity } from "./activityController.js";
import {
  buildDashboard,
  createCampaignMetrics,
  toClientCampaign,
} from "../services/dashboardService.js";
import { buildProfessionalEmail } from "../services/emailTemplateService.js";
import {
  getDefaultRecipients,
  normalizeRecipients,
} from "../services/mailService.js";
import { enqueueCampaignEmail } from "../services/emailQueueService.js";

const formatNumber = (value) => new Intl.NumberFormat("en-US").format(value);

const applyTemplateVariables = (value = "", campaign) =>
  String(value)
    .replaceAll("{{campaignName}}", campaign.name)
    .replaceAll("{{subject}}", campaign.subject)
    .replaceAll("{{content}}", campaign.content || "")
    .replaceAll("{{recipientCount}}", String(campaign.recipients.length));

const finalizeTemplateHtml = ({ htmlContent, background, campaign }) => {
  const body = applyTemplateVariables(htmlContent || "<p>{{content}}</p>", campaign);
  const hasFullDocument = /<html[\s>]/i.test(body) || /<body[\s>]/i.test(body);

  if (hasFullDocument) {
    return body;
  }

  return `<!doctype html>
<html>
  <body style="margin:0;background:${background || "#f8fafc"};font-family:Arial,sans-serif;color:#0f172a;">
    ${body}
    <p style="text-align:center;color:#64748b;font-size:12px;margin:18px 0 28px;">
      You are receiving this email because you are included in a Mail Nova campaign.
    </p>
  </body>
</html>`;
};

const resolveCampaignContent = async (req, campaignDraft) => {
  if (!req.body.templateId) {
    return buildProfessionalEmail({
      campaignName: campaignDraft.name,
      subject: campaignDraft.subject,
      content: campaignDraft.content,
    });
  }

  const template = await Template.findById(req.body.templateId).lean();
  if (!template) {
    const error = new Error("Selected template was not found.");
    error.status = 404;
    throw error;
  }

  return {
    htmlContent: finalizeTemplateHtml({
      htmlContent: req.body.htmlContent || template.htmlContent,
      background: req.body.templateBackground || template.background,
      campaign: campaignDraft,
    }),
    textContent: applyTemplateVariables(
      req.body.textContent || template.textContent || campaignDraft.content,
      campaignDraft
    ),
    template,
  };
};

const resolveCampaignRecipients = async (req) => {
  const manualRecipients = normalizeRecipients(req.body.recipients);

  if (manualRecipients.length) {
    return {
      recipients: manualRecipients,
      contactList: null,
    };
  }

  if (req.body.contactListId) {
    const list = await ContactList.findById(req.body.contactListId)
      .populate("contacts", "email")
      .lean();

    if (!list) {
      const error = new Error("Selected contact folder was not found.");
      error.status = 404;
      throw error;
    }

    const listRecipients = normalizeRecipients(
      (list.contacts || []).map((contact) => contact.email).filter(Boolean)
    );

    if (listRecipients.length === 0) {
      const error = new Error("Selected contact folder has no contacts with email addresses.");
      error.status = 400;
      throw error;
    }

    return {
      recipients: listRecipients,
      contactList: {
        id: list._id,
        name: list.name,
      },
    };
  }

  return {
    recipients: getDefaultRecipients(),
    contactList: null,
  };
};

export const getCampaigns = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();
    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { campaignName: { $regex: query, $options: "i" } },
            { campaign_name: { $regex: query, $options: "i" } },
            { title: { $regex: query, $options: "i" } },
            { campaignTitle: { $regex: query, $options: "i" } },
            { subject: { $regex: query, $options: "i" } },
            { emailSubject: { $regex: query, $options: "i" } },
            { mailSubject: { $regex: query, $options: "i" } },
            { status: { $regex: query, $options: "i" } },
            { sendStatus: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 }).lean();
    res.json(campaigns.map(toClientCampaign));
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const status = req.body.status === "Draft" ? "Draft" : "Running";
    const { recipients: finalRecipients, contactList } = await resolveCampaignRecipients(req);
    const campaignDraft = {
      name: req.body.name?.trim() || "Untitled Campaign",
      subject: req.body.subject?.trim() || "Campaign update",
      content: req.body.content?.trim() || "",
      recipients: finalRecipients,
    };
    const metrics =
      status === "Draft"
        ? createCampaignMetrics({})
        : createCampaignMetrics({
            ...req.body,
            emailsSent: finalRecipients.length,
            delivered: 0,
          });
    const { htmlContent, textContent, template } = await resolveCampaignContent(req, campaignDraft);

    const campaign = await Campaign.create({
      name: campaignDraft.name,
      subject: campaignDraft.subject,
      content: campaignDraft.content,
      recipients: finalRecipients,
      htmlContent,
      textContent,
      template: template?._id || null,
      templateName: template?.name || "",
      contactList: contactList?.id || null,
      contactListName: contactList?.name || "",
      status,
      sendStatus: status === "Draft" ? "draft" : "pending",
      ...metrics,
    });

    let emailSendError = "";

    if (status !== "Draft") {
      try {
        const emailResult = await enqueueCampaignEmail({
          recipients: finalRecipients,
          subject: campaign.subject,
          htmlContent,
          textContent,
        });

        campaign.sendStatus = "sent";
        campaign.status = "Completed";
        campaign.sendError = "";
        campaign.emailsSent = finalRecipients.length;
        campaign.delivered = Array.isArray(emailResult.accepted)
          ? emailResult.accepted.length
          : finalRecipients.length;
        campaign.opened = Number(req.body.opened || 0);
        campaign.clicked = Number(req.body.clicked || 0);
        await campaign.save();

        await EmailLog.create({
          campaign: campaign._id,
          recipients: finalRecipients,
          subject: campaign.subject,
          htmlContent,
          textContent,
          status: "sent",
          providerMessageId: emailResult.messageId || "",
        });
      } catch (error) {
        emailSendError = error.message;
        campaign.sendStatus = "failed";
        campaign.status = "Failed";
        campaign.sendError = emailSendError;
        campaign.emailsSent = 0;
        campaign.delivered = 0;
        campaign.opened = 0;
        campaign.clicked = 0;
        await campaign.save();

        await EmailLog.create({
          campaign: campaign._id,
          recipients: finalRecipients,
          subject: campaign.subject,
          htmlContent,
          textContent,
          status: "failed",
          error: emailSendError,
        });
      }
    }

    await Notification.create({
      type: "campaign",
      title:
        status === "Draft"
          ? "Campaign draft saved"
          : emailSendError
          ? "Campaign email failed"
          : "Campaign sent successfully",
      desc: `${campaign.name} ${
        status === "Draft"
          ? "was saved as a draft"
          : emailSendError
          ? `could not be sent: ${emailSendError}`
          : `was sent to ${formatNumber(finalRecipients.length)} recipient${finalRecipients.length === 1 ? "" : "s"}${campaign.contactListName ? ` from the ${campaign.contactListName} contact folder` : ""}${campaign.templateName ? ` using the ${campaign.templateName} template` : ""}`
      }. This is one campaign notification for the whole bulk send.`,
      time: "Just now",
      read: false,
    });

    await recordActivity({
      action: status === "Draft" ? "campaign.draft_saved" : "campaign.created",
      entityType: "Campaign",
      entityId: campaign._id,
      actor: req.user?._id,
      message: `${campaign.name} ${status === "Draft" ? "saved as draft" : "created and queued for sending"}`,
      metadata: {
        recipients: finalRecipients.length,
        templateName: campaign.templateName,
        contactListName: campaign.contactListName,
        sendStatus: campaign.sendStatus,
      },
    });

    const [campaigns, notifications] = await Promise.all([
      Campaign.find().sort({ createdAt: -1 }).lean(),
      Notification.find().sort({ createdAt: -1 }).lean(),
    ]);

    res.status(201).json({
      campaign: toClientCampaign(campaign),
      dashboard: buildDashboard(campaigns, notifications),
    });
  } catch (error) {
    next(error);
  }
};
