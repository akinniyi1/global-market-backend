const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const productsFile = path.join(__dirname, "data-products.json");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.postProduct = async (req, res) => {
  const { name, description, price, currency } = req.body;
  if (!name || !price || !currency)
    return res.status(400).json({ msg: "Name, price, and currency are required." });

  let mediaUrl = "";

  if (req.file) {
    try {
      const uploadRes = await cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (err, result) => {
          if (err || !result) {
            return res.status(500).json({ msg: "Upload failed", error: err });
          }

          const products = JSON.parse(fs.readFileSync(productsFile));
          const newProduct = {
            id: Date.now().toString(),
            name,
            description,
            price,
            currency,
            mediaUrl: result.secure_url,
            createdAt: new Date().toISOString(),
          };

          products.push(newProduct);
          fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
          res.status(201).json({ msg: "Product created", product: newProduct });
        }
      );

      uploadRes.end(req.file.buffer);
    } catch (err) {
      return res.status(500).json({ msg: "Upload failed", error: err });
    }
  } else {
    return res.status(400).json({ msg: "No media uploaded" });
  }
};

exports.getAllProducts = (req, res) => {
  const products = JSON.parse(fs.readFileSync(productsFile));
  res.json(products);
};
