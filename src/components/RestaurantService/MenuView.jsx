import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  X, Edit, Trash2, AlertCircle, Search, Filter, Clock,
  DollarSign, Tag, CheckCircle, XCircle, Plus, Save
} from "lucide-react";

const MenuView = ({ restaurantId, restaurantName, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    preparationTimeInMin: "",
    isAvailable: true,
    tags: []
  });
  const [tag, setTag] = useState("");

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`http://localhost:8001/api/menus/menu/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMenuItems(res.data);
    } catch (err) {
      setError("Failed to load menu items: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingItem) {
      setEditForm({
        name: editingItem.name || "",
        description: editingItem.description || "",
        category: editingItem.category || "",
        price: editingItem.price || "",
        preparationTimeInMin: editingItem.preparationTimeInMin || "",
        isAvailable: editingItem.isAvailable ?? true,
        tags: [...(editingItem.tags || [])],
      });
    }
  }, [editingItem]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddTag = () => {
    if (tag.trim() !== "" && !editForm.tags.includes(tag.trim())) {
      setEditForm({ ...editForm, tags: [...editForm.tags, tag.trim()] });
      setTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditForm({
      name: "",
      description: "",
      category: "",
      price: "",
      preparationTimeInMin: "",
      isAvailable: true,
      tags: [],
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const payload = {
        ...editForm,
        price: parseFloat(editForm.price),
        preparationTimeInMin: parseInt(editForm.preparationTimeInMin, 10),
      };

      const res = await axios.put(`http://localhost:8001/api/menu/${editingItem._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMenuItems(menuItems.map(item => item._id === editingItem._id ? res.data : item));
      handleCancelEdit();
      alert("Menu item updated successfully!");
    } catch (err) {
      setError("Failed to update menu item: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }

        await axios.delete(`http://localhost:8001/api/menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMenuItems(menuItems.filter((item) => item._id !== id));
        if (editingItem?._id === id) {
          handleCancelEdit();
        }

        alert("Menu item deleted successfully!");
      } catch (err) {
        setError("Failed to delete menu item: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {restaurantName} - Menu Items
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {!editingItem ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg w-full"
              >
                <option value="">All Categories</option>
                {categories.map((category, idx) => (
                  <option key={idx} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {menuItems.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">No menu items found for this restaurant.</p>
            </div>
          ) : filteredMenuItems.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <p className="text-gray-500">No menu items match your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMenuItems.map((item) => (
                <div key={item._id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                        {item.isAvailable ? (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <DollarSign size={14} className="mr-1" />
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="flex items-center">
                          <Tag size={14} className="mr-1" />
                          {item.category}
                        </span>
                        {item.preparationTimeInMin && (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {item.preparationTimeInMin} min
                          </span>
                        )}
                      </div>

                      {item.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Edit Form (optional for you to include)
        <div className="p-4 border rounded bg-white shadow">
          {/* You can add the form inputs here as needed */}
          <p>Edit mode UI goes here.</p>
          <button onClick={handleSaveEdit} className="mt-4 bg-orange-500 text-white px-4 py-2 rounded">
            Save Changes
          </button>
          <button onClick={handleCancelEdit} className="ml-2 text-gray-500 underline">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuView;
