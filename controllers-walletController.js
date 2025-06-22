const fs = require("fs");
const path = require("path");
const walletsFile = path.join(__dirname, "data-wallets.json");

// ✅ View Wallet
exports.getWallet = (req, res) => {
  const { email } = req.query;
  const wallets = JSON.parse(fs.readFileSync(walletsFile));
  const wallet = wallets.find(w => w.email === email);
  if (!wallet) return res.status(404).json({ msg: "Wallet not found" });
  res.json(wallet);
};
