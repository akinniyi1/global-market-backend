const express = require("express");
const multer = require("multer");
const router = express.Router();
const { postProduct, getAllProducts } = require("./controllers-productController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", upload.single("media"), postProduct);
router.get("/all", getAllProducts);

module.exports = router;
