import cron from "node-cron";

import Campaign from "../models/campaignModel.js";

import {
  sendEmail
} from "../services/emailService.js";

cron.schedule(
  "* * * * *",
  async () => {

    try {

      const now =
        new Date();

      const campaigns =
        await Campaign.find({

          status:
            "scheduled",

          scheduledTime: {
            $lte: now
          }

        });

      for (
        const campaign
        of campaigns
      ) {

        let successCount = 0;

        let failedCount = 0;

        for (
          const recipient
          of campaign.recipients
        ) {

          try {

            await sendEmail(
              recipient.email,
              campaign
            );

            successCount++;

          } catch (error) {

            console.log(
              error
            );

            failedCount++;

          }

        }

        campaign.status =
          "sent";

        campaign.sentCount =
          successCount;

        campaign.deliveredCount =
          successCount;

        campaign.failedCount =
          failedCount;

        await campaign.save();

        console.log(
          `✅ Scheduled campaign sent: ${campaign.title}`
        );

      }

    } catch (error) {

      console.log(
        "Scheduler Error:",
        error.message
      );

    }

  }
);