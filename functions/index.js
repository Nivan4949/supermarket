const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const nodemailer = require("nodemailer");

/**
 * Reduce stock after a new order is created
 */
exports.reduceStockOnOrder = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      const order = snap.data();
      const items = order.items;

      const batch = db.batch();

      for (const item of items) {
        const productRef = db.collection("products").doc(item.id);
        batch.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-item.quantity),
        });

        // Create stock movement log
        const logRef = db.collection("stock_movements").doc();
        batch.set(logRef, {
          productId: item.id,
          orderId: context.params.orderId,
          type: "sale",
          quantity: item.quantity,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return batch.commit();
    });

/**
 * Send email notification to customer
 */
exports.sendOrderEmail = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      const order = snap.data();
      const orderId = context.params.orderId;
      const customer = order.customer;

      if (!customer.email) {
        console.log("No customer email provided, skipping email notification.");
        return null;
      }

      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";

      if (!emailUser || !emailPass) {
        console.error("Email environment variables (EMAIL_USER, EMAIL_PASS) are missing.");
        return null;
      }

      const transporter = nodemailer.createTransport({
        host: emailHost,
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const isAr = order.language === "ar";
      const itemsHtml = order.items.map((item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${isAr ? item.name_ar : item.name_en} x ${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} SAR</td>
        </tr>
      `).join("");

      const title = isAr ? "تأكيد الطلب - تموينات السنابل الأولى" : "Order Confirmation - Super market Sanabel oula";
      const greeting = isAr ? `مرحباً ${customer.name}` : `Hello ${customer.name}`;
      const message = isAr ? "شكراً لطلبك من تموينات السنابل الأولى. لقد استلمنا طلبك وهو قيد المعالجة الآن." : "Thank you for your order from Super market Sanabel oula. We have received your order and it is now being processed.";
      const orderDetailsLabel = isAr ? "تفاصيل الطلب" : "Order Details";
      const totalLabel = isAr ? "الإجمالي" : "Total";
      const trackLabel = isAr ? "تتبع طلبك" : "Track Your Order";
      const trackUrl = `https://supermarket-sand.vercel.app/track?orderId=${orderId}`;

      const html = `
        <div dir="${isAr ? "rtl" : "ltr"}" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #0070f3; text-align: center;">${title}</h2>
          <p><strong>${greeting},</strong></p>
          <p>${message}</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${orderDetailsLabel}</h3>
            <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 10px; font-weight: bold;">${totalLabel}</td>
                <td style="padding: 10px; font-weight: bold; text-align: right;">${order.total.toFixed(2)} SAR</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${trackUrl}" style="background-color: #0070f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">${trackLabel}</a>
          </div>
          
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #888; text-align: center;">
            &copy; ${new Date().getFullYear()} Super market Sanabel oula. All rights reserved.
          </p>
        </div>
      `;

      try {
        await transporter.sendMail({
          from: `"Super market Sanabel oula" <${emailUser}>`,
          to: customer.email,
          subject: title,
          html: html,
        });
        console.log(`Email sent successfully to ${customer.email}`);
      } catch (error) {
        console.error("Error sending email:", error);
      }

      return null;
    });
