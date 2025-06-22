const express = require("express");
const router = express.Router();
const { payForProduct } = require("./controllers-escrowController");

router.post("/pay", payForProduct);

module.exports = router;
