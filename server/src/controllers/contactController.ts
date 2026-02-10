import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { ENV } from "../config/env";
import { sendContactEmail } from "../utils/mailer";

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message, subject } = req.body || {};
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required" });
    }

    const record = await queries.createContactMessage({
      name,
      email,
      message,
      subject,
      status: "new",
    });
    const escapeHtml = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    sendContactEmail({
      to: ENV.CONTACT_EMAIL_TO || "codewithja@gmail.com",
      from: ENV.SMTP_FROM_EMAIL || ENV.SMTP_USER || "no-reply@rayhana.com",
      subject: subject || `New contact message from ${name}`,
      html: `<p><b>Name:</b> ${escapeHtml(name)}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Subject:</b> ${escapeHtml(
        subject || "(none)"
      )}</p><p>${escapeHtml(message)}</p>`,
    }).catch(err => console.error("Failed to send contact email", err));

    res.status(201).json(record);
  } catch (error) {
    console.error("Error creating contact message", error);
    res.status(500).json({ error: "Failed to submit message" });
  }
};

export const listMessages = async (req: Request, res: Response) => {
  try {
    const rawStatus = req.query.status;
    const statusParam = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
    const normalizedStatus =
      typeof statusParam === "string" ? statusParam : undefined;
    const status =
      normalizedStatus === "new" || normalizedStatus === "resolved"
        ? normalizedStatus
        : undefined;
    const limit = Math.min(
      100,
      Number(req.query.limit) > 0 ? Number(req.query.limit) : 20
    );
    const rawCursor = req.query.cursor;
    const cursor: string | undefined = Array.isArray(rawCursor)
      ? typeof rawCursor[0] === "string"
        ? rawCursor[0]
        : undefined
      : typeof rawCursor === "string"
        ? rawCursor
        : undefined;

    const result = await queries.listContactMessages({
      status,
      limit,
      cursorId: cursor || undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error listing contact messages", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawStatus = (
      req.body as {
        status?: "new" | "resolved" | string | string[];
      }
    ).status;
    const statusParam = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
    const statusValueRaw =
      typeof statusParam === "string" ? statusParam : undefined;
    if (statusValueRaw !== "new" && statusValueRaw !== "resolved") {
      return res.status(400).json({ error: "Invalid status" });
    }
    const statusValue: "new" | "resolved" = statusValueRaw;
    const updated = await queries.updateContactMessageStatus(
      String(id),
      statusValue
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating contact message", error);
    res.status(500).json({ error: "Failed to update message" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await queries.deleteContactMessage(String(id));
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.status(200).json(deleted);
  } catch (error) {
    console.error("Error deleting contact message", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
