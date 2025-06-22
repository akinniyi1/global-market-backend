const fs = require("fs");
const path = require("path");

const usersFile = path.join(__dirname, "data-users.json");
const productsFile = path.join(__dirname, "data-products.json");
const escrowFile = path.join(__dirname, "data-escrow.json");

exports.getAllUsers = (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersFile));
  res.json(users);
};

exports.getAllProducts = (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsFile));
  res.json(products);
};

exports.getDisputes = (req, res) => {
  const escrow = JSON.parse(fs.readFileSync(escrowFile));
  const disputes = escrow.filter(e => e.status === "disputed");
  res.json(disputes);
};
