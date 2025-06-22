const express = require("express");
const router = express.Router();
const { registerSeller } = require("./controllers-authController");

router.post("/register", registerSeller);

module.exports = router;
