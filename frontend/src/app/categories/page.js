'use client';
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Header from "@/component/Header";

const page = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10 px-6">
        <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Categories</h2>

          {/* Add Category Form */}
          <form
            onSubmit={handleAddCategory}
            className="flex flex-col gap-3 mb-6"
          >
            <input
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <textarea
              placeholder="Enter category description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>

          {/* Categories List */}
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center">No categories added yet.</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex flex-col bg-gray-100 rounded-lg px-4 py-2"
                >
                  <span className="text-gray-800 font-medium">{cat.name}</span>
                  {cat.description && <span className="text-gray-600 text-sm">{cat.description}</span>}
                  <span className="text-sm text-gray-500 mt-1">ID: {cat._id}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
