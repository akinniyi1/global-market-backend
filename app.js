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

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Create JSON files if they don't exist
["users.json", "products.json", "messages.json"].forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
});

// Routes
app.get("/", (req, res) => res.send("🌍 Global Market API is live!"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/support", require("./routes/support"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
