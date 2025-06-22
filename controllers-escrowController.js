const fs = require("fs");
const path = require("path");

const escrowFile = path.join(__dirname, "data-escrow.json");
const walletsFile = path.join(__dirname, "data-wallets.json");

// ✅ PAY INTO ESCROW
exports.payForProduct = (req, res) => {
  const { productId, amount, buyerEmail, sellerEmail } = req.body;

  if (!productId || !amount || !buyerEmail || !sellerEmail) {
    return res.status(400).json({ msg: "Missing payment details" });
  }

  const fee = parseFloat((amount * 0.008).toFixed(2));
  const amountAfterFee = amount - fee;

  const escrowData = fs.existsSync(escrowFile)
    ? JSON.parse(fs.readFileSync(escrowFile))
    : [];

  const newEscrow = {
    id: Date.now().toString(),
    productId,
    buyerEmail,
    sellerEmail,
    amountPaid: amount,
    fee,
    amountAfterFee,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  escrowData.push(newEscrow);
  fs.writeFileSync(escrowFile, JSON.stringify(escrowData, null, 2));

  res.status(200).json({ msg: "Payment successful, held in escrow", escrow: newEscrow });
};

// ✅ MARK ORDER AS DELIVERED & RELEASE FUNDS
exports.markAsDelivered = (req, res) => {
  const { escrowId } = req.body;

  if (!escrowId) return res.status(400).json({ msg: "escrowId is required" });

  const escrowData = JSON.parse(fs.readFileSync(escrowFile));
  const wallets = JSON.parse(fs.readFileSync(walletsFile));

  const order = escrowData.find(e => e.id === escrowId);
  if (!order) return res.status(404).json({ msg: "Escrow order not found" });
  if (order.status !== "pending")
    return res.status(400).json({ msg: "This order has already been released or disputed" });

  // Mark as delivered
  order.status = "delivered";
  order.deliveredAt = new Date().toISOString();

  // Credit seller wallet
  const sellerWallet = wallets.find(w => w.email === order.sellerEmail);
  if (!sellerWallet)
    return res.status(404).json({ msg: "Seller wallet not found" });

  sellerWallet.balance += order.amountAfterFee;
  sellerWallet.history.push({
    type: "credit",
    amount: order.amountAfterFee,
    from: order.buyerEmail,
    productId: order.productId,
    date: new Date().toISOString()
  });

  // Save updates
  fs.writeFileSync(escrowFile, JSON.stringify(escrowData, null, 2));
  fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 2));

  res.status(200).json({ msg: "Escrow released to seller", order });
};

// ✅ RAISE DISPUTE
exports.raiseDispute = (req, res) => {
  const { escrowId, reason } = req.body;

  const escrowData = JSON.parse(fs.readFileSync(escrowFile));
  const order = escrowData.find(e => e.id === escrowId);

  if (!order) return res.status(404).json({ msg: "Escrow not found" });
  if (order.status !== "pending")
    return res.status(400).json({ msg: "Order already closed" });

  order.status = "disputed";
  order.disputeReason = reason || "No reason provided";
  order.disputeAt = new Date().toISOString();

  fs.writeFileSync(escrowFile, JSON.stringify(escrowData, null, 2));

  res.status(200).json({ msg: "Dispute filed", order });
};

// ✅ ADMIN: AUTO-CHECK & EXPIRE OLD ORDERS
exports.expireOldOrders = (req, res) => {
  const escrowData = JSON.parse(fs.readFileSync(escrowFile));
  const wallets = JSON.parse(fs.readFileSync(walletsFile));

  let updatedCount = 0;
  const now = new Date();

  escrowData.forEach(order => {
    if (order.status === "pending") {
      const createdAt = new Date(order.createdAt);
      const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

      if (diffDays >= 5) {
        // Expire and send to dispute
        order.status = "disputed";
        order.disputeAt = now.toISOString();
        order.disputeReason = "Auto-disputed: No delivery confirmation after 5 days";
        updatedCount++;
      }
    }
  });

  fs.writeFileSync(escrowFile, JSON.stringify(escrowData, null, 2));

  res.json({ msg: `${updatedCount} orders auto-disputed` });
};
