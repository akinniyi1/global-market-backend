const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllProducts,
  getDisputes
} = require("./controllers-adminController");

router.get("/users", getAllUsers);
router.get("/products", getAllProducts);
router.get("/disputes", getDisputes);

module.exports = router;
