import { Resend } from "resend";
import { logger } from "../logger/index.js";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "The Craft Pallet <onboarding@resend.dev>";
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const formatEmailPrice = (amount: any): string => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const emailService = {
  /**
   * 1. Order Placed Email (Awaiting Payment / Draft)
   */
  sendOrderPlacedEmail: async (order: any) => {
    if (!resend || !order.customer?.email) return;

    const isDraft = order.status === "DRAFT";
    const trackLink = `${clientUrl}/track?order=${order.orderNumber}&phone=${order.customer.phone}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2B2B2B; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #A68A75; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 500; margin: 0; color: #2B2B2B;">The Craft Pallet</h1>
          <p style="font-style: italic; color: #A68A75; margin: 4px 0 0;">Crafting Memories</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Hi ${order.customer.name},</p>
        <p style="font-size: 15px; line-height: 1.6;">
          ${isDraft 
            ? "Your WhatsApp draft order has been successfully created! Let's complete the final steps on WhatsApp." 
            : "Your order has been placed successfully and is awaiting payment verification."}
        </p>

        <div style="background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 6px; padding: 18px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #A68A75; text-transform: uppercase; letter-spacing: 0.05em;">Order Details</p>
          <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #2B2B2B;">${order.orderNumber}</p>
          <p style="margin: 0; font-size: 13px; color: #7F7F7F;">Placed on ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #7F7F7F; margin-bottom: 12px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          ${order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #EAEAEA;">
              <td style="padding: 10px 0; font-size: 14px; color: #2B2B2B;">
                <strong>${item.productName}</strong> ${item.variantName ? `(${item.variantName})` : ""}
                <br /><span style="font-size: 11px; color: #7F7F7F;">Qty: ${item.quantity}</span>
              </td>
              <td style="padding: 10px 0; text-align: right; font-size: 14px; font-weight: 600; color: #2B2B2B;">
                ${formatEmailPrice(item.totalPrice)}
              </td>
            </tr>
          `).join("")}
          <tr>
            <td style="padding: 12px 0 4px; font-size: 14px; color: #7F7F7F;">Subtotal</td>
            <td style="padding: 12px 0 4px; text-align: right; font-size: 14px; color: #2B2B2B;">${formatEmailPrice(order.subtotal)}</td>
          </tr>
          ${Number(order.discountAmount) > 0 ? `
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #25D366;">Discount</td>
            <td style="padding: 4px 0; text-align: right; font-size: 14px; color: #25D366; font-weight: 600;">-${formatEmailPrice(order.discountAmount)}</td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 4px 0 12px; font-size: 14px; color: #7F7F7F;">Shipping</td>
            <td style="padding: 4px 0 12px; text-align: right; font-size: 14px; color: #2B2B2B;">${formatEmailPrice(order.shippingCharge)}</td>
          </tr>
          <tr style="border-top: 1px dashed #A68A75;">
            <td style="padding: 12px 0; font-size: 16px; font-weight: 700; color: #2B2B2B;">Total Amount</td>
            <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: 700; color: #A68A75;">${formatEmailPrice(order.totalAmount)}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${trackLink}" target="_blank" style="background-color: #2B2B2B; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
            Track Your Order
          </a>
        </div>

        <p style="font-size: 13px; color: #7F7F7F; text-align: center; line-height: 1.5; margin-top: 40px; border-top: 1px solid #EAEAEA; padding-top: 20px;">
          If you have any questions, chat with us on WhatsApp at +91 97462 92208 or reply directly to this email.
        </p>
      </div>
    `;

    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: order.customer.email,
        subject: `Order Received — ${order.orderNumber}`,
        html,
      });

      if (response.error) {
        logger.error(`Resend failed for ${order.orderNumber}: ${response.error.message}`);
      } else {
        logger.info(`Email sent: Order Placed for ${order.orderNumber}`);
      }
    } catch (err) {
      logger.error(`Failed to send Order Placed email for ${order.orderNumber}:`, err);
    }
  },

  /**
   * 2. Order Confirmed Email (Payment Success)
   */
  sendOrderConfirmedEmail: async (order: any) => {
    if (!resend || !order.customer?.email) return;

    const trackLink = `${clientUrl}/track?order=${order.orderNumber}&phone=${order.customer.phone}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2B2B2B; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #A68A75; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 500; margin: 0; color: #2B2B2B;">The Craft Pallet</h1>
          <p style="font-style: italic; color: #A68A75; margin: 4px 0 0;">Crafting Memories</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Hi ${order.customer.name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #25D366; font-weight: 600;">✓ Payment Verified & Order Confirmed!</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Your payment has been successfully verified. We are now preparing your custom order. If your product requires photos and you haven't uploaded them yet, please upload them via the tracking page link below.
        </p>

        <div style="background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 6px; padding: 18px; margin: 24px 0;">
          <p style="margin: 0; font-size: 15px; color: #2B2B2B;">Order ID: <strong>${order.orderNumber}</strong></p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #7F7F7F;">Status: <strong>Confirmed — Entering Production</strong></p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${trackLink}" target="_blank" style="background-color: #2B2B2B; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
            Upload Photos / Track Progress
          </a>
        </div>

        <p style="font-size: 13px; color: #7F7F7F; text-align: center; line-height: 1.5; margin-top: 40px; border-top: 1px solid #EAEAEA; padding-top: 20px;">
          We handcraft each item with love. Expect delivery within 7-10 working days.
        </p>
      </div>
    `;

    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: order.customer.email,
        subject: `Payment Confirmed — Order ${order.orderNumber}`,
        html,
      });

      if (response.error) {
        logger.error(`Resend failed for ${order.orderNumber}: ${response.error.message}`);
      } else {
        logger.info(`Email sent: Order Confirmed for ${order.orderNumber}`);
      }
    } catch (err) {
      logger.error(`Failed to send Order Confirmed email for ${order.orderNumber}:`, err);
    }
  },

  /**
   * 3. Order Shipped Email (with tracking link)
   */
  sendOrderShippedEmail: async (order: any, trackingNumber: string) => {
    if (!resend || !order.customer?.email) return;

    const trackLink = `${clientUrl}/track?order=${order.orderNumber}&phone=${order.customer.phone}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2B2B2B; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #A68A75; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 500; margin: 0; color: #2B2B2B;">The Craft Pallet</h1>
          <p style="font-style: italic; color: #A68A75; margin: 4px 0 0;">Crafting Memories</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Hi ${order.customer.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #A68A75; font-weight: 600;">🚚 Your Order Has Been Shipped!</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Your custom keepsakes have finished production and are on their way to you!
        </p>

        <div style="background-color: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 6px; padding: 18px; margin: 24px 0;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #7F7F7F;">Tracking Number</p>
          <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #2B2B2B; font-family: monospace; letter-spacing: 1px;">${trackingNumber}</p>
          <a href="https://www.indiapost.gov.in/" target="_blank" style="color: #A68A75; font-size: 13px; font-weight: 600; text-decoration: underline;">
            Track on India Post →
          </a>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${trackLink}" target="_blank" style="background-color: #2B2B2B; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">
            View Tracking Dashboard
          </a>
        </div>

        <p style="font-size: 13px; color: #7F7F7F; text-align: center; line-height: 1.5; margin-top: 40px; border-top: 1px solid #EAEAEA; padding-top: 20px;">
          Thank you for shopping with us! If your parcel arrives damaged, please alert us within 48 hours.
        </p>
      </div>
    `;

    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: order.customer.email,
        subject: `Your Order ${order.orderNumber} Has Shipped!`,
        html,
      });

      if (response.error) {
        logger.error(`Resend failed for ${order.orderNumber}: ${response.error.message}`);
      } else {
        logger.info(`Email sent: Order Shipped for ${order.orderNumber}`);
      }
    } catch (err) {
      logger.error(`Failed to send Order Shipped email for ${order.orderNumber}:`, err);
    }
  },

  /**
   * 4. Order Delivered Email
   */
  sendOrderDeliveredEmail: async (order: any) => {
    if (!resend || !order.customer?.email) return;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #2B2B2B; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #A68A75; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: 500; margin: 0; color: #2B2B2B;">The Craft Pallet</h1>
          <p style="font-style: italic; color: #A68A75; margin: 4px 0 0;">Crafting Memories</p>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Hi ${order.customer.name},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #25D366; font-weight: 600;">🎉 Order Delivered!</p>
        <p style="font-size: 15px; line-height: 1.6;">
          Your order <strong>${order.orderNumber}</strong> has been successfully delivered. We hope these handmade keepsakes bring a smile to your face!
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          If you love your items, we would appreciate it if you could share a picture and tag us on Instagram or WhatsApp!
        </p>

        <p style="font-size: 13px; color: #7F7F7F; text-align: center; line-height: 1.5; margin-top: 40px; border-top: 1px solid #EAEAEA; padding-top: 20px;">
          Have issues or feedback? Chat with us on WhatsApp at +91 97462 92208.
        </p>
      </div>
    `;

    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: order.customer.email,
        subject: `Delivered: Order ${order.orderNumber}`,
        html,
      });

      if (response.error) {
        logger.error(`Resend failed for ${order.orderNumber}: ${response.error.message}`);
      } else {
        logger.info(`Email sent: Order Delivered for ${order.orderNumber}`);
      }
    } catch (err) {
      logger.error(`Failed to send Order Delivered email for ${order.orderNumber}:`, err);
    }
  },
};