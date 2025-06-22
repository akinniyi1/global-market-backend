const fs = require("fs");
const path = require("path");

const escrowFile = path.join(__dirname, "data-escrow.json");
const walletsFile = path.join(__dirname, "data-wallets.json");

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
