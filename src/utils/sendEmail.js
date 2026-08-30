import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export const sendApplicationSubmitMail = async ({ to, officeName, applicantName, applicationType, applicationNo }) => {
  if (!to) return;
  try {
    await transporter.sendMail({
      from: `"${officeName}" <${process.env.SMTP_FROM}>`,
      to,
      subject: `Application Received for ${applicationType} Certificate`,
      html: `<p>Dear ${applicantName},</p>
        <p>Your application for <b>${applicationType}</b> certificate has been received.</p>
        <p>Application No: <b>${applicationNo}</b></p>
        <p>Regards,<br/>${officeName}</p>`,
    });
  } catch (error) {
    console.error("Mail sending failed:", error.message);
  }
};