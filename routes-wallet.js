const express = require("express");
const router = express.Router();
const { getWallet } = require("./controllers-walletController");

router.get("/", getWallet);

module.exports = router;
