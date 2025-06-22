const express = require("express");
const router = express.Router();
const {
  payForProduct,
  markAsDelivered,
  raiseDispute,
  expireOldOrders
} = require("./controllers-escrowController");

// 💰 Buyer pays → funds held
router.post("/pay", payForProduct);

// ✅ Buyer confirms delivery → funds go to seller
router.post("/deliver", markAsDelivered);

// 🚨 Seller raises dispute
router.post("/dispute", raiseDispute);

// 🕒 Admin triggers auto-expiry of stale orders
router.get("/check-expired", expireOldOrders);

module.exports = router;
