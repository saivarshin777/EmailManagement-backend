import transporter from "../config/smtp.js";

export const sendEmail = async (
  recipient,
  campaign
) => {

  const info =
    await transporter.sendMail({

      from:
        `"MailNova" <${process.env.EMAIL_USER}>`,

      to: recipient,

      subject:
        campaign.subject,

      html: `
<div style="font-family: Arial, sans-serif; padding: 20px;">

  <h1 style="color:#2563eb;">
    ${campaign.title}
  </h1>

  <hr>

  <h3>
    ${campaign.subject}
  </h3>

  <p>
    ${campaign.content}
  </p>

  <br>

  <a
    href="http://localhost:5000/api/campaigns/track/click/${campaign._id}"
  >
    Learn More
  </a>

  <img
    src="http://localhost:5000/api/campaigns/track/open/${campaign._id}"
    width="1"
    height="1"
    style="display:none;"
  />

  <hr>

  <p style="color:gray;">
    Sent via MailNova Email Campaign System
  </p>

</div>
`

    });

  console.log(
    `✅ Email sent to ${recipient}`
  );

  return info;

};