import React, { useState } from "react";
import axios from "axios";
import { X, Save, Plus, Minus, DollarSign, Clock, Tag, FileText, Utensils } from "lucide-react";

const MenuAddForm = ({ restaurantId, onClose }) => {
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    preparationTimeInMin: "",
    isAvailable: true,
    tags: []
  });
  
  const [tag, setTag] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setMenuItem({
      ...menuItem,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAddTag = () => {
    if (tag.trim() !== "" && !menuItem.tags.includes(tag.trim())) {
      setMenuItem({
        ...menuItem,
        tags: [...menuItem.tags, tag.trim()]
      });
      setTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setMenuItem({
      ...menuItem,
      tags: menuItem.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const payload = {
        ...menuItem,
        restaurantId,
        price: parseFloat(menuItem.price),
        preparationTimeInMin: parseInt(menuItem.preparationTimeInMin, 10)
      };

      await axios.post(
        "http://localhost:8001/api/menus/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Menu item added successfully!");
      setMenuItem({
        name: "",
        description: "",
        category: "",
        price: "",
        preparationTimeInMin: "",
        isAvailable: true,
        tags: []
      });
    } catch (err) {
      console.error("Error adding menu item:", err);
      setError("Failed to add menu item: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "appetizer", label: "Appetizer", icon: "🍤" },
    { value: "main", label: "Main Course", icon: "🍽️" },
    { value: "dessert", label: "Dessert", icon: "🍰" },
    { value: "beverage", label: "Beverage", icon: "🍹" },
    { value: "side", label: "Side Dish", icon: "🥗" },
    { value: "special", label: "Special", icon: "✨" },
  ];

  return (
    <div className="p-6 space-y-5 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Add Menu Item</h3>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-5">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={menuItem.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Enter dish name"
                required
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Utensils size={18} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={menuItem.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Describe your dish, ingredients, etc."
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FileText size={18} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={menuItem.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={menuItem.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="0.00"
                  required
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <DollarSign size={18} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preparation Time
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="preparationTimeInMin"
                  value={menuItem.preparationTimeInMin}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="15"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Clock size={18} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add tags (e.g., spicy, vegan)"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <Tag size={18} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gray-100 px-4 py-2.5 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {menuItem.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {menuItem.tags.map((tagItem, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 transition-all hover:bg-orange-200"
                  >
                    {tagItem}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tagItem)}
                      className="ml-1.5 inline-flex items-center justify-center hover:text-orange-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              checked={menuItem.isAvailable}
              onChange={handleInputChange}
              className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
              Available for order
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-sm flex items-center"
            disabled={loading}
          >
            <Save className="mr-2" size={16} />
            {loading ? "Saving..." : "Save Menu Item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuAddForm;