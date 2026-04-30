import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch Order Details from Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orderSnap.data();
    const customer = order.customer;
    const items = order.items;

    // 2. Update Stock and Log Movements
    // We do this here on the server to ensure it happens even if the client closes the tab
    for (const item of items) {
      try {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });

        // Log movement
        await addDoc(collection(db, 'stock_movements'), {
          productId: item.id,
          orderId: orderId,
          type: 'sale',
          quantity: item.quantity,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error(`Error updating stock for product ${item.id}:`, error);
      }
    }

    // 3. Send Email Notification if email is provided
    if (customer.email) {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';

      if (emailUser && emailPass) {
        console.log(`[Email] Attempting connection for ${emailUser}...`);
        const transporter = nodemailer.createTransport({
          host: emailHost,
          port: 465,
          secure: true,
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        // Verify connection configuration
        try {
          await transporter.verify();
          console.log("[Email] Server is ready to take our messages");
        } catch (verifyError) {
          console.error("[Email] Verification failed:", verifyError);
          return NextResponse.json({ error: `SMTP Verification failed: ${verifyError}` }, { status: 500 });
        }

        const isAr = order.language === 'ar';
        // ... (email construction logic remains same)
        const itemsHtml = items.map((item: any) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${isAr ? item.name_ar : item.name_en} x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} SAR</td>
          </tr>
        `).join('');

        const title = isAr ? 'تأكيد الطلب - تموينات السنابل الأولى' : 'Order Confirmation - Super market Sanabel oula';
        const greeting = isAr ? `مرحباً ${customer.name}` : `Hello ${customer.name}`;
        const message = isAr ? 'شكراً لطلبك من تموينات السنابل الأولى. لقد استلمنا طلبك وهو قيد المعالجة الآن.' : 'Thank you for your order from Super market Sanabel oula. We have received your order and it is now being processed.';
        const orderDetailsLabel = isAr ? 'تفاصيل الطلب' : 'Order Details';
        const totalLabel = isAr ? 'الإجمالي' : 'Total';
        const trackLabel = isAr ? 'تتبع طلبك' : 'Track Your Order';
        const trackUrl = `https://supermarket-sand.vercel.app/track?orderId=${orderId}`;

        const html = `
          <div dir="${isAr ? 'rtl' : 'ltr'}" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
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

        await transporter.sendMail({
          from: `"Super market Sanabel oula" <${emailUser}>`,
          to: customer.email,
          subject: title,
          html: html,
        });
      } else {
        console.warn('Email credentials missing in environment variables');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Order API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
