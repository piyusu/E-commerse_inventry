"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/component/Header";

const page = () => {
  const [cart, setCart] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart_v1");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (id, qty) => {
    const updated = cart.map((item) =>
      item.product_id === id ? { ...item, qty: Number(qty) } : item
    );
    setCart(updated);
    localStorage.setItem("cart_v1", JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.product_id !== id);
    setCart(updated);
    localStorage.setItem("cart_v1", JSON.stringify(updated));
  };

  const handleCheckout = async () => {
  if (!username.trim()) {
    alert("Please enter username");
    return;
  }
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      username,
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.qty),
      })),
    };

    console.log("Checkout payload:", payload);

    const res = await api.post("/orders", payload);

    //  Clear cart after success
    localStorage.removeItem("cart_v1");
    setCart([]);
    setUsername("");

    alert(`Order placed successfully! Total: ₹ ${(res.data.data.total_paise / 100).toFixed(2)}`);
    console.log("Order response:", res.data);
  } catch (err) {
    console.error("Checkout error:", err.response?.data || err.message);
    alert(err.response?.data?.error || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price_paise * item.qty,
    0
  );

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">🛒 Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-gray-500">Cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-4 mb-6">
              {cart.map((item) => (
                <li
                  key={item.product_id}
                  className="flex justify-between items-center bg-white p-4 rounded shadow"
                >
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-gray-600">
                      ₹ {(item.price_paise / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        updateQuantity(item.product_id, e.target.value)
                      }
                      className="border p-2 rounded w-16"
                    />
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      ✖
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="text-lg font-semibold mb-4">
              Total: ₹ {(cartTotal / 100).toFixed(2)}
            </div>

            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 rounded w-full md:w-1/2 mb-4"
            />

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-500"
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default page;
