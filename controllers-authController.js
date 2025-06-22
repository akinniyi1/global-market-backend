const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const usersFile = path.join(__dirname, "data-users.json");
const walletsFile = path.join(__dirname, "data-wallets.json");

exports.registerSeller = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ msg: "All fields are required" });

  const users = JSON.parse(fs.readFileSync(usersFile));
  if (users.find(u => u.email === email))
    return res.status(409).json({ msg: "Email already exists" });

  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    role: "seller",
    plan: "free",
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  // Create empty wallet for this user
  const wallets = fs.existsSync(walletsFile)
    ? JSON.parse(fs.readFileSync(walletsFile))
    : [];

  wallets.push({
    email,
    balance: 0,
    escrow: 0,
    history: [],
    lastUpgrade: null
  });

  fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 2));

  const token = jwt.sign({ id: newUser.id, email }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.status(201).json({ token, user: newUser });
};
