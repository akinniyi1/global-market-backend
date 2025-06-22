const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 Ensure all required data files exist
const files = [
  "data-users.json",
  "data-products.json",
  "data-messages.json",
  "data-wallets.json",
  "data-escrow.json"
];
files.forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

// ✅ Import all routes
const authRoutes = require("./routes-auth");
const productRoutes = require("./routes-products");
const escrowRoutes = require("./routes-escrow");
const walletRoutes = require("./routes-wallet");
const adminRoutes = require("./routes-admin");

// ✅ API Routes
app.get("/", (req, res) => res.send("🌍 Global Market API is live!"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
