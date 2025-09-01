import React, { useState } from "react";
import api from "../lib/api";

const ProductCard = ({ product, addToCart, refreshProducts, currencyFormatter }) => {
  const [editing, setEditing] = useState(false);
  const [stock, setStock] = useState(product.stock_quantity);
  const [loading, setLoading] = useState(false);

  const handleStockUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/products/${product._id}/stock`, { set: Number(stock) });
      setEditing(false);
      if (refreshProducts) refreshProducts(); // Refresh parent list
      alert("Stock updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 hover:shadow-lg transition">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">{currencyFormatter(product.price_paise)}</p>
      <p className="text-gray-500 text-sm">{product.category?.name || "No Category"}</p>

      <p className="mt-2">
        <span className="font-medium">Stock:</span>{" "}
        {editing ? (
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border rounded px-2 py-1 w-20"
          />
        ) : (
          stock
        )}
      </p>

      <div className="flex gap-2 mt-2">
        {editing ? (
          <>
            <button
              onClick={handleStockUpdate}
              disabled={loading}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setStock(product.stock_quantity);
              }}
              className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Edit Stock
          </button>
        )}

        <button
          onClick={() => addToCart(product)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
