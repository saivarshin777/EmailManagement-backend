import Campaign from "../models/campaignModel.js";

export const getAnalytics = async (
  req,
  res
) => {
  try {

    const campaigns =
      await Campaign.find();

    const totalSent =
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
      totalSent > 0
        ? (
            (totalOpened /
              totalSent) *
            100
          ).toFixed(1)
        : 0;

    const clickRate =
      totalSent > 0
        ? (
            (totalClicked /
              totalSent) *
            100
          ).toFixed(1)
        : 0;

    res.status(200).json({
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      openRate,
      clickRate
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};
export const getChartData =
  async (req, res) => {

    try {

      const campaigns =
        await Campaign.find()
          .sort({
            createdAt: 1
          });

      const chartData =
        campaigns.map(
          (campaign) => ({
            name:
              campaign.title,

            sent:
              campaign.sentCount,

            delivered:
              campaign.deliveredCount,

            opened:
              campaign.openedCount,

            clicked:
              campaign.clickedCount
          })
        );

      res.status(200).json(
        chartData
      );

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

};