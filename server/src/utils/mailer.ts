import nodemailer from "nodemailer";
import { ENV } from "../config/env";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST || "smtp.gmail.com",
  port: ENV.SMTP_PORT ? Number(ENV.SMTP_PORT) : 587,
  secure: false,
  auth:
    ENV.SMTP_USER && ENV.SMTP_PASS
      ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS }
      : undefined,
});

export const sendContactEmail = async ({
  to,
  from,
  subject,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
}) => {
  if (!to) return;
  await transporter.sendMail({ from, to, subject, html });
};
