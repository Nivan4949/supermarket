const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

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
 * Generate a friendly Order ID if needed (though Firestore ID is used)
 */
exports.generateOrderNumber = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snap, context) => {
      // Logic for sequential order numbers could go here
      // For now, we use the Firestore ID
      return null;
    });
