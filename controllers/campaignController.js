import Campaign from "../models/campaignModel.js";
import Notification from "../models/notificationModel.js";
import { sendEmail } from "../services/emailService.js";

export const createCampaign = async (
  req,
  res
) => {

  try {

    const {
      title,
      subject,
      content,
      recipients
    } = req.body;

    const campaign =
      await Campaign.create({
        title,
        subject,
        content,
        recipients,
        status: "draft"
      });

    await Notification.create({

      title: "Campaign Created",

      message:
        `${title} created successfully`,

      type: "success"

    });

    if (
      recipients &&
      recipients.length > 0
    ) {

      const results =
        await Promise.allSettled(

          recipients.map(
            recipient =>
              sendEmail(
                recipient.email,
                campaign
              )
          )

        );

      const successCount =
        results.filter(
          result =>
            result.status === "fulfilled"
        ).length;

      const failedCount =
        results.filter(
          result =>
            result.status === "rejected"
        ).length;

      campaign.sentCount =
        successCount;

      campaign.deliveredCount =
        successCount;

      campaign.failedCount =
        failedCount;

      if (successCount > 0) {

        campaign.status =
          "sent";

      }

      await campaign.save();

    }

    res.status(201).json({

      success: true,

      message:
        "Campaign created successfully",

      campaign

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

export const sendCampaign = async (
  req,
  res
) => {

  try {

    const campaign =
      await Campaign.findById(
        req.params.id
      );

    if (!campaign) {

      return res.status(404).json({

        success: false,

        message:
          "Campaign not found"

      });

    }

    console.log(
      `📨 Sending Campaign: ${campaign.title}`
    );

    const results =
      await Promise.allSettled(

        campaign.recipients.map(
          recipient =>
            sendEmail(
              recipient.email,
              campaign
            )
        )

      );

    const successCount =
      results.filter(
        result =>
          result.status === "fulfilled"
      ).length;

    const failedCount =
      results.filter(
        result =>
          result.status === "rejected"
      ).length;

    campaign.status = "sent";

campaign.sentCount =
  successCount;

campaign.deliveredCount =
  successCount;

campaign.failedCount =
  failedCount;


    await campaign.save();

    console.log(
      `📊 Success: ${successCount}, Failed: ${failedCount}`
    );

    res.status(200).json({

      success: true,

      message:
        "Campaign sent successfully",

      successCount,

      failedCount

    });

  } catch (error) {

    console.log(
      "❌ Send Campaign Error:"
    );

    console.log(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

export const getCampaigns = async (
  req,
  res
) => {

  try {

    const campaigns =
      await Campaign.find()
      .sort({
        createdAt: -1
      });

    console.log(
      `📋 Total Campaigns: ${campaigns.length}`
    );

    res.status(200).json(
      campaigns
    );

  } catch (error) {

    console.log(
      "❌ Get Campaigns Error:"
    );

    console.log(error);

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

};export const getAllCampaigns =
  async (req, res) => {

    const campaigns =
      await Campaign.find()
      .sort({
        createdAt: -1
      });

    res.json(campaigns);

};
export const searchCampaigns =
  async (req, res) => {

    try {

      const query =
        req.query.search || "";

      const campaigns =
        await Campaign.find({
          title: {
            $regex: query,
            $options: "i"
          }
        });

      res.status(200).json(
        campaigns
      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

};
export const getCampaignHistory =
  async (req, res) => {

    try {

      const campaigns =
        await Campaign.find()
          .sort({
            createdAt: -1
          });

      res.status(200).json(
        campaigns
      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

};
export const trackOpen = async (
  req,
  res
) => {

  try {

    await Campaign.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          openedCount: 1
        }
      }
    );

    res.send("Tracking OK");

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

};
export const trackClick = async (
  req,
  res
) => {

  try {

    await Campaign.updateOne(
      { _id: req.params.id },
      {
        $inc: {
          clickedCount: 1
        }
      }
    );

    res.redirect(
      "https://google.com"
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });

  }

};