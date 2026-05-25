import nodemailer from "nodemailer"
import type { OrderItem } from "./types"

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendContactNotification(name: string, email: string, subject: string, message: string, fileUrl?: string) {
  const transporter = getTransporter()
  if (!transporter) return

  const to = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER
  if (!to) return

  await transporter.sendMail({
    from: `"Al-Tabakh Contact" <${process.env.SMTP_USER}>`,
    to,
    replyTo: email,
    subject: `[Al-Tabakh Contact] ${subject}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D11D1D; margin-bottom: 16px;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        ${fileUrl ? `<p style="margin-top: 12px;"><a href="${fileUrl}" style="color: #D11D1D;">View attached file</a></p>` : ""}
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Sent from Al-Tabakh website contact form</p>
      </div>
    `,
  })
}

export async function sendOrderStatusNotification(customerEmail: string, customerName: string, status: string, orderId: string) {
  const transporter = getTransporter()
  if (!transporter || !customerEmail) return

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444",
  }

  await transporter.sendMail({
    from: `"Al-Tabakh" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: `Order #${orderId.slice(0, 8)} is now ${statusLabels[status] || status}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D11D1D; margin-bottom: 16px;">Order Status Update</h2>
        <p>Hi ${customerName},</p>
        <p>Your order <strong>#${orderId.slice(0, 8)}</strong> status has been updated to:</p>
        <div style="text-align: center; padding: 16px; margin: 16px 0; border-radius: 8px; font-size: 18px; font-weight: bold; color: #fff; background: ${statusColors[status] || "#6b7280"}">
          ${statusLabels[status] || status}
        </div>
        <p>Thank you for choosing Al-Tabakh!</p>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Sent from Al-Tabakh website order system</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const transporter = getTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"Al-Tabakh" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your Al-Tabakh password",
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D11D1D; margin-bottom: 16px;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #D11D1D; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Al-Tabakh Premium Catalog</p>
      </div>
    `,
  })
}

export async function sendOrderNotification(items: OrderItem[], customerName: string, customerPhone: string, notes: string, orderId: string) {
  const transporter = getTransporter()
  if (!transporter) return

  const to = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER
  if (!to) return

  const itemsHtml = items.map(i =>
    `<tr><td style="padding: 6px 8px; border-bottom: 1px solid #eee;">${i.name_en}</td><td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td></tr>`
  ).join("")

  await transporter.sendMail({
    from: `"Al-Tabakh Orders" <${process.env.SMTP_USER}>`,
    to,
    subject: `[Al-Tabakh] New Order #${orderId.slice(0, 8)}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #D11D1D; margin-bottom: 16px;">New Order Received</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Order ID</td><td style="padding: 8px 0;">${orderId}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Customer</td><td style="padding: 8px 0;">${customerName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Phone</td><td style="padding: 8px 0;"><a href="tel:${customerPhone}">${customerPhone}</a></td></tr>
          ${notes ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Notes</td><td style="padding: 8px 0;">${notes}</td></tr>` : ""}
        </table>
        <h3 style="margin-top: 20px; margin-bottom: 10px;">Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Product</th><th style="padding: 8px; text-align: center;">Qty</th></tr>
          ${itemsHtml}
        </table>
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Sent from Al-Tabakh website order system</p>
      </div>
    `,
  })
}
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #666;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        ${fileUrl ? `<p style="margin-top: 12px;"><a href="${fileUrl}" style="color: #D11D1D;">View attached file</a></p>` : ""}
        <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Sent from Al-Tabakh website contact form</p>
      </div>
    `,
  })
}
