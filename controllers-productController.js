const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const productsFile = path.join(__dirname, "data-products.json");
const usersFile = path.join(__dirname, "data-users.json");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
exports.upload = multer({ storage }).single("media");

exports.createProduct = async (req, res) => {
  const { name, description, price, currency, email } = req.body;
  const mediaFile = req.file;

  if (!name || !description || !price || !currency || !email || !mediaFile) {
    return res.status(400).json({ msg: "All fields and media are required" });
  }

  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ msg: "User not found" });

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const products = fs.existsSync(productsFile)
    ? JSON.parse(fs.readFileSync(productsFile))
    : [];

  const sellerProductsThisMonth = products.filter(p => {
    const pDate = new Date(p.createdAt);
    return (
      p.email === email &&
      pDate.getMonth() === month &&
      pDate.getFullYear() === year
    );
  });

  // Free plan limit logic
  if (user.plan === "free" && sellerProductsThisMonth.length >= 1) {
    return res.status(403).json({
      msg: "Free plan users can only post 1 product per month. Please upgrade."
    });
  }

  // Upload to Cloudinary
  const uploaded = await cloudinary.uploader.upload_stream(
    { resource_type: "auto" },
    (err, result) => {
      if (err || !result)
        return res.status(500).json({ msg: "Cloudinary upload failed" });

      const newProduct = {
        id: Date.now().toString(),
        name,
        description,
        price,
        currency,
        mediaUrl: result.secure_url,
        email,
        createdAt: new Date().toISOString()
      };

      products.push(newProduct);
      fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

      res.status(201).json({ msg: "Product created", product: newProduct });
    }
  );

  uploaded.end(mediaFile.buffer);
};
