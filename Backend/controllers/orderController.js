const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

const TAX_RATE = Number(process.env.TAX_RATE || 0.0);

function cents(n) {
  // safe conversion helper (assumes input already integer cents)
  return Math.round(Number(n));
}

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.product");
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { username, items } = req.body;

    if (!username || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "username and items are required" });
    }

    // Fetch all product details
    const productIds = items.map(
      (i) => new mongoose.Types.ObjectId(i.product_id)
    );
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    const productMap = {};
    for (const p of products) {
      productMap[p._id.toString()] = p;
    }

    let total_paise = 0;
    const orderItems = [];

    for (const i of items) {
      const product = productMap[i.product_id];
      if (!product) throw new Error(`Product not found: ${i.product_id}`);

      const qty = Math.floor(Number(i.quantity));
      if (!Number.isInteger(qty) || qty <= 0)
        throw new Error("Invalid quantity");

      if (product.stock_quantity < qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}`,
        });
      }

      // FIX: Use correct price field from DB
      const price_paise = product.price_paise; // ✅ Match your schema

      total_paise += price_paise * qty;

      orderItems.push({
        product: product._id,
        quantity: qty,
        price_at_time_paise: price_paise,
      });
    }

    const order = new Order({
      username,
      items: orderItems,
      total_paise,
      status: "pending",
    });

    await order.save({ session });

    // Deduct stock
    for (const i of orderItems) {
      await Product.updateOne(
        { _id: i.product, stock_quantity: { $gte: i.quantity } },
        { $inc: { stock_quantity: -i.quantity } }
      ).session(session);
    }

    await session.commitTransaction();
    res.status(201).json({ data: order });
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    next(err);
  } finally {
    session.endSession();
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  /**
   * body: { status: 'fulfilled' | 'cancelled' }
   * If cancelled: restock items (only if previously deducted)
   */
  const { status } = req.body;
  const valid = ["pending", "fulfilled", "cancelled"];
  if (!valid.includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status === status) {
      await session.commitTransaction();
      session.endSession();
      return res.json({ data: order });
    }

    // If cancelling a pending order -> restock items
    if (status === "cancelled" && order.status === "pending") {
      // increment stock back
      for (const it of order.items) {
        await Product.updateOne(
          { _id: it.product },
          { $inc: { stock_quantity: it.quantity } }
        ).session(session);
      }
    }

    // Optionally, you might disallow cancel after fulfilled in business rules
    if (status === "fulfilled") {
      order.fulfilled_at = new Date();
    }

    order.status = status;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ data: order });
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    next(err);
  }
};

exports.getUserOrders = async (req, res, next) => {
  try {
    const username = req.params.username; // match your route
    const orders = await Order.find({ username }).sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (err) {
    next(err);
  }
};

/**
 * fulfill endpoint: for this implementation, createOrder already decremented stock.
 * So fulfill just marks order fulfilled (or perform shipping steps).
 */
exports.fulfillOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "pending")
      return res
        .status(400)
        .json({ error: "Only pending orders can be fulfilled" });
    order.status = "fulfilled";
    order.fulfilled_at = new Date();
    await order.save();
    res.json({ data: order });
  } catch (err) {
    next(err);
  }
};
