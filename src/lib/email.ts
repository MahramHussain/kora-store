import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailItem {
  name: string;
  size: string;
  quantity: number;
  price: string;
}

interface SendOrderEmailParams {
  toEmail: string;
  customerName: string;
  referenceNumber: string;
  items: EmailItem[];
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  shippingAddress: string;
}

export async function sendOrderConfirmationEmail(params: SendOrderEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY is not defined. Email transmission bypassed.");
    return { success: false, error: "API Key missing" };
  }

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px;">
          <strong>${item.name}</strong><br/>
          <span style="color: #64748b; font-size: 12px;">Size: ${item.size}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #0f172a; font-size: 14px;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: bold; font-size: 14px;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  const isAdmin = params.toEmail === "mahramh40@gmail.com";

  const emailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; padding: 32px 16px; color: #334155; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: #6b00ff; padding: 32px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.04em; text-transform: uppercase;">
            ${isAdmin ? "NEW ORDER ALERT" : "GEAR SECURED."}
          </h1>
          <p style="margin: 8px 0 0 0; color: #e9d5ff; font-weight: bold; font-size: 14px; letter-spacing: 0.05em;">
            REFERENCE: #${params.referenceNumber}
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <h2 style="margin-top: 0; font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase;">
            ${isAdmin ? "A new order has been received!" : `Thank you for your order, ${params.customerName}!`}
          </h2>
          <p style="color: #475569; font-size: 14px;">
            ${isAdmin 
              ? `Customer <strong>${params.customerName}</strong> has placed a new order. The full details are below:` 
              : "Your premium drop has been secured. Below is your detailed receipt and delivery breakdown:"
            }
          </p>

          <!-- Order Bill Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Item</th>
                <th style="padding: 12px; text-align: center; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Qty</th>
                <th style="padding: 12px; text-align: right; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; font-size: 14px; color: #475569;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Subtotal</td>
                <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: bold;">${params.subtotal}</td>
              </tr>
              ${
                parseFloat(params.discount.replace(/[^0-9.]/g, "")) > 0
                  ? `<tr>
                      <td style="padding: 4px 0; color: #16a34a;">Discount Code</td>
                      <td style="padding: 4px 0; text-align: right; color: #16a34a; font-weight: bold;">-${params.discount}</td>
                     </tr>`
                  : ""
              }
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Shipping Fee</td>
                <td style="padding: 4px 0; text-align: right; color: #0f172a; font-weight: bold;">${params.shippingFee}</td>
              </tr>
              <tr style="font-size: 18px; border-top: 1px solid #e2e8f0;">
                <td style="padding: 12px 0 0 0; font-weight: 800; color: #0f172a; text-transform: uppercase; font-size: 13px; letter-spacing: 0.05em;">Total</td>
                <td style="padding: 12px 0 0 0; text-align: right; font-weight: 900; color: #6b00ff;">${params.total}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="margin-top: 32px; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; font-size: 13px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 800; text-transform: uppercase; color: #0f172a; font-size: 11px; letter-spacing: 0.05em;">Delivery Destination</h3>
            <p style="margin: 0; color: #475569; line-height: 1.5;">${params.shippingAddress}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; font-weight: 500;">
          <p style="margin: 0 0 8px 0;">This email was sent to ${params.toEmail}</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} KoraStore. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await resend.emails.send({
      from: "KoraStore <orders@korastore.ae>",
      to: params.toEmail,
      subject: isAdmin 
        ? `🔔 New Order Received! (Order #${params.referenceNumber})`
        : `Your Kora Drop is Secured! (Order #${params.referenceNumber})`,
      html: emailHtml,
    });
    return { success: true, response };
  } catch (error) {
    console.error("Failed to send order email:", error);
    return { success: false, error };
  }
}
