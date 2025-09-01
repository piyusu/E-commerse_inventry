"use client";
import { useEffect, useState } from "react";
import Header from "../component/Header";
import ProductCard from "../component/ProductCard";
import api from "../lib/api";

const Page = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "", // in rupees for input
    stock_quantity: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  async function fetchProducts(category = "", keyword = "") {
    try {
      const res = await api.get("/products", {
        params: { category, q: keyword },
      });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts("", search);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value / 100); // because stored in paise
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products");
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    }
    fetchProducts();

    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart_v1");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product) => {
    const existing = cart.find((c) => c.product_id === product._id);
    let nextCart;
    if (existing) {
      nextCart = cart.map((c) =>
        c.product_id === product._id ? { ...c, qty: c.qty + 1 } : c
      );
    } else {
      nextCart = [
        ...cart,
        {
          product_id: product._id,
          name: product.name,
          price_paise: product.price_paise,
          qty: 1,
        },
      ];
    }
    setCart(nextCart);
    localStorage.setItem("cart_v1", JSON.stringify(nextCart));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price_cents" || name === "stock_quantity"
          ? Number(value)
          : value,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/products", {
        ...form,
        price_paise: Math.round(Number(form.price) * 100),
      });

      setProducts((prev) => [res.data.data, ...prev]);
      setForm({
        name: "",
        sku: "",
        price: "",
        stock_quantity: "",
        category: "",
      });
      alert("Product added successfully!");
    } catch (err) {
      console.error("Error adding product:", err);
      alert(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  async function fetchProducts(category = "") {
    try {
      const res = await api.get("/products", {
        params: { category },
      });
      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price_paise * item.qty,
    0
  );

  return (
    <>
      <Header />
      <main className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Products</h2>

        {/* Add Product Form */}
        <form
          className="mb-8 p-6 border rounded-lg bg-white shadow-md"
          onSubmit={handleAddProduct}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Add New Product
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <select
                name="category"
                value={form.category || ""}
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Product Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                placeholder="Product Name"
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">SKU</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                placeholder="SKU"
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Price (INR)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                placeholder="Price in INR"
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
                min={0}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={form.stock_quantity}
                placeholder="Stock"
                onChange={handleInputChange}
                className="border p-2 rounded w-full"
                required
                min={0}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-64 "
          />

          <select
            onChange={(e) => fetchProducts(e.target.value, search)}
            className="border p-2 rounded"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.isArray(products) &&
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                addToCart={addToCart}
                refreshProducts={() => fetchProducts()}
                currencyFormatter={formatCurrency}
              />
            ))}
        </div>
      </main>
    </>
  );
};

export default Page;
