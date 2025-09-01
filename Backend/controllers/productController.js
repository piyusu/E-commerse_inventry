const Product = require("../models/Product");
const Category = require("../models/Category");

exports.listProducts = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category) filter.category = category;

    const skip = (Math.max(1, page) - 1) * Math.min(200, limit);
    const products = await Product.find(filter)
      .populate("category")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Convert price back to INR for response
    const data = products.map((p) => ({
      ...p,
      price_inr: (p.price_paise / 100).toFixed(2),
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, price, stock_quantity = 0, category } = req.body;

    if (!name || !sku || price === undefined) {
      return res
        .status(400)
        .json({ error: "name, sku, and price are required" });
    }

    // Validate category
    let cat = null;
    if (category) {
      cat = await Category.findById(category);
      if (!cat) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }

    // Convert INR to paise
    const price_paise = Math.round(Number(price) * 100);
    if (isNaN(price_paise) || price_paise < 0) {
      return res.status(400).json({ error: "Invalid price" });
    }

    const product = new Product({
      name,
      sku,
      price_paise,
      stock_quantity,
      category: cat ? cat._id : undefined,
    });

    await product.save();
    const savedProduct = await product.populate("category");

    res.status(201).json({
      data: {
        ...savedProduct.toObject(),
        price_inr: (savedProduct.price_paise / 100).toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body;

    // Validate category if provided
    if (update.category) {
      const catExists = await Category.findById(update.category);
      if (!catExists) {
        return res.status(400).json({ error: "Invalid category" });
      }
    }

    // Convert price if provided
    if (update.price) {
      const price_paise = Math.round(Number(update.price) * 100);
      if (isNaN(price_paise) || price_paise < 0) {
        return res.status(400).json({ error: "Invalid price" });
      }
      update.price_paise = price_paise;
      delete update.price;
    }

    const product = await Product.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("category");

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      data: {
        ...product.toObject(),
        price_inr: (product.price_paise / 100).toFixed(2),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.lowStock = async (req, res, next) => {
  try {
    const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 10);
    const items = await Product.find({
      stock_quantity: { $lt: threshold },
    }).populate("category");
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
};

/**
 * Update stock endpoint:
 * body: { set: Number }   -> set absolute stock_quantity
 * or   { adjustment: Number } -> increment (can be negative)
 */
exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { set, adjustment } = req.body;

    let product;
    if (typeof set === "number") {
      if (set < 0)
        return res.status(400).json({ error: "stock cannot be negative" });
      product = await Product.findByIdAndUpdate(
        id,
        { stock_quantity: set },
        { new: true }
      );
    } else if (typeof adjustment === "number") {
      // Use atomic increment
      product = await Product.findOneAndUpdate(
        { _id: id, stock_quantity: { $gte: Math.max(0, -adjustment) } },
        { $inc: { stock_quantity: adjustment } },
        { new: true }
      );
      if (!product) {
        // either product not found or adjustment would make negative
        const exists = await Product.findById(id);
        if (!exists)
          return res.status(404).json({ error: "Product not found" });
        return res
          .status(400)
          .json({ error: "Adjustment would lead to negative stock" });
      }
    } else {
      return res.status(400).json({ error: "set or adjustment required" });
    }

    res.json({ data: product });
  } catch (err) {
    next(err);
  }
};
