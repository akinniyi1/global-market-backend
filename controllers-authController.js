const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const usersFile = path.join(__dirname, "data-users.json");

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
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
  res.status(201).json({ token, user: newUser });
};
