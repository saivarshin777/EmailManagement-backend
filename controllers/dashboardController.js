import Campaign from "../models/campaignModel.js";
import Notification from "../models/notificationModel.js";


export const getDashboardData = async (
  req,
  res
) => {

  try {

    const campaigns =
      await Campaign.find();

    const notifications =
      await Notification.find()
        .sort({
          createdAt: -1
        })
        .limit(5);

    const totalCampaigns =
      campaigns.length;

    const totalEmailsSent =
      campaigns.reduce(
        (sum, campaign) =>
          sum + campaign.sentCount,
        0
      );

    const totalDelivered =
      campaigns.reduce(
        (sum, campaign) =>
          sum +
          campaign.deliveredCount,
        0
      );

    const totalOpened =
      campaigns.reduce(
        (sum, campaign) =>
          sum +
          campaign.openedCount,
        0
      );

    const totalClicked =
      campaigns.reduce(
        (sum, campaign) =>
          sum +
          campaign.clickedCount,
        0
      );

    const openRate =
      totalEmailsSent > 0
        ? (
            (totalOpened /
              totalEmailsSent) *
            100
          ).toFixed(1)
        : 0;

    const clickRate =
      totalEmailsSent > 0
        ? (
            (totalClicked /
              totalEmailsSent) *
            100
          ).toFixed(1)
        : 0;

    const recentCampaigns =
      await Campaign.find()
        .sort({
          createdAt: -1
        })
        .limit(5);

    const topCampaigns =
  await Campaign.find({
    status: "sent"
  })
  .sort({
    openedCount: -1,
    clickedCount: -1,
    deliveredCount: -1
  })
  .limit(5);

    

    res.status(200).json({

      overview: {
        totalCampaigns,
        totalEmailsSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        openRate,
        clickRate
      },

      performanceData,

      topCampaigns,

      recentCampaigns,

      notifications

    });

  } catch (error) {

    res.status(500).json({
      message:
        error.message
    });

  }

};