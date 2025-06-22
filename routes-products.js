const express = require("express");
const router = express.Router();

const {
  createProduct,
  upload
} = require("./controllers-productController");

// POST /api/products/create
router.post("/create", upload, createProduct);

module.exports = router;
