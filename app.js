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

// 🔐 Ensure all data files exist
const files = [
  "data-users.json",
  "data-products.json",
  "data-wallets.json",
  "data-messages.json",
  "data-escrow.json"
];
files.forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

// ✅ Routes
app.get("/", (req, res) => res.send("🌍 Global Market API is live!"));
app.use("/api/auth", require("./routes-auth"));         // Register/Login
app.use("/api/products", require("./routes-products")); // Product creation
app.use("/api/escrow", require("./routes-escrow"));     // Escrow payment system

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
