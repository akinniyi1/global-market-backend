const express = require("express");
const router = express.Router();
const {
  registerSeller,
  loginSeller
} = require("./controllers-authController");

router.post("/register", registerSeller);
router.post("/login", loginSeller); // 🔐 Add this line for seller login

module.exports = router;
