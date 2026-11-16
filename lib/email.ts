import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Transactional email sent through Gmail / Google Workspace (smtp.gmail.com) with an App Password.
 * Needs GMAIL_USER and GMAIL_APP_PASSWORD in the environment; without them emails are skipped
 * (and logged), so the shop keeps working in development.
 */
const USER = process.env.GMAIL_USER?.trim() ?? "";
// Google shows App Passwords in groups of four ("abcd efgh ijkl mnop"); the spaces aren't part of it.
const PASS = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "") ?? "";
const FROM_NAME = process.env.EMAIL_FROM_NAME?.trim() || "MELI";
const REPLY_TO = process.env.EMAIL_REPLY_TO?.trim() ?? "";

export const emailReady = Boolean(USER && PASS);

let transport: Transporter | null = null;
function getTransport() {
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: USER, pass: PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transport;
}

type Mail = { to: string; subject: string; html: string; text: string };

export async function sendEmail({ to, subject, html, text }: Mail): Promise<boolean> {
  if (!emailReady) {
    console.warn(`[email] Skipped "${subject}": set GMAIL_USER and GMAIL_APP_PASSWORD to send emails.`);
    return false;
  }
  try {
    await getTransport().sendMail({
      // Gmail only sends as the signed-in account (or an alias added to it in Gmail settings).
      from: { name: FROM_NAME, address: USER },
      to,
      subject,
      html,
      text,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    });
    return true;
  } catch (e) {
    const err = e as { code?: string; responseCode?: number; message?: string };
    if (err.responseCode === 535) {
      console.error("[email] Gmail refused the login. Check GMAIL_USER and that GMAIL_APP_PASSWORD is an App Password (not your normal password).");
    } else {
      console.error(`[email] Couldn't send "${subject}": ${err.code ?? ""} ${err.message ?? e}`);
    }
    return false;
  }
}
