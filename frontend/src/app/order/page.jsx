"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/component/Header";
const page = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  //  Fetch Products
  async function fetchProducts() {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }

  //  Fetch Orders
  async function fetchOrders(username = "") {
    setLoadingOrders(true);
    try {
      let url = "/orders"; // for all orders
      if (username.trim()) {
        url = `/orders/user/${username}`;
      }
      const res = await api.get(url);
      console.log("Fetched orders:", res.data);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  //  Update order status
  async function updateOrderStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders(searchUsername); // refresh
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  }

  //  Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(searchUsername);
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">All Orders</h2>

        {/*  Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            className="border p-2 rounded w-1/3"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
          {searchUsername && (
            <button
              type="button"
              onClick={() => {
                setSearchUsername("");
                fetchOrders();
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Reset
            </button>
          )}
        </form>

        {/*  Orders List */}
        {loadingOrders ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders found</p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <li
                key={order._id}
                className="bg-white p-4 rounded shadow space-y-4 border"
              >
                {/*  Order Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">
                      Order ID: {order._id}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Placed by:{" "}
                      <span className="font-medium">{order.username}</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      Placed on: {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-white text-sm ${
                      order.status === "pending"
                        ? "bg-yellow-500"
                        : order.status === "fulfilled"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/*  Order Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>Total: ₹{(order.total_paise / 100).toFixed(2)}</div>
                  {order.fulfilled_at && (
                    <div>
                      Fulfilled At:{" "}
                      {new Date(order.fulfilled_at).toLocaleString()}
                    </div>
                  )}
                </div>

                {/*  Items */}
                <div>
                  <h4 className="font-semibold mb-2">Items:</h4>
                  <ul className="list-disc pl-6 text-gray-800">
                    {order.items.map((it, idx) => {
                      const product =
                        it.product && it.product.name
                          ? it.product // populated
                          : products.find((p) => p._id === it.product);
                      return (
                        <li key={idx}>
                          {product ? product.name : "Unknown Product"} ×{" "}
                          {it.quantity} @ ₹
                          {(it.price_at_time_paise / 100).toFixed(2)}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/*  Action Buttons */}
                {order.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateOrderStatus(order._id, "fulfilled")}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Fulfill
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order._id, "cancelled")}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default page;
