// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   X, Edit, Trash2, AlertCircle, Search, Filter,
//   DollarSign, Tag, CheckCircle, XCircle, Plus, Save
// } from "lucide-react";

// const MenuView = ({ restaurantId, restaurantName, onClose }) => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [editingItem, setEditingItem] = useState(null);
//   const [editForm, setEditForm] = useState({
//     name: "",
//     description: "",
//     category: "",
//     price: "",
//     isAvailable: true,
//     tags: []
//   });
//   const [tag, setTag] = useState("");

//   // Define categories array with icons, matching the one in MenuAddForm
//   const categories = [
//     { value: "appetizer", label: "Appetizer", icon: "🍤" },
//     { value: "main", label: "Main Course", icon: "🍽️" },
//     { value: "dessert", label: "Dessert", icon: "🍰" },
//     { value: "beverage", label: "Beverage", icon: "🍹" },
//     { value: "side", label: "Side Dish", icon: "🥗" },
//     { value: "special", label: "Special", icon: "✨" },
//   ];

//   useEffect(() => {
//     if (restaurantId) {
//       fetchMenuItems();
//     } else {
//       setLoading(false);
//       setError("Restaurant ID is missing. Please select a restaurant.");
//     }
//   }, [restaurantId]);

//   const fetchMenuItems = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Authentication token not found. Please log in again.");
//         setLoading(false);
//         return;
//       }
//       const res = await axios.get(`http://localhost:8001/api/menus/restaurant/${restaurantId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(res.data);
//     } catch (err) {
//       setError("Failed to load menu items: " + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (editingItem) {
//       setEditForm({
//         name: editingItem.name || "",
//         description: editingItem.description || "",
//         category: editingItem.category || "",
//         price: editingItem.price || "",
//         isAvailable: editingItem.isAvailable ?? true,
//         tags: [...(editingItem.tags || [])],
//       });
//     }
//   }, [editingItem]);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEditForm(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleAddTag = () => {
//     if (tag.trim() !== "" && !editForm.tags.includes(tag.trim())) {
//       setEditForm(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
//       setTag("");
//     }
//   };

//   const handleRemoveTag = (tagToRemove) => {
//     setEditForm(prev => ({
//       ...prev,
//       tags: prev.tags.filter((t) => t !== tagToRemove),
//     }));
//   };

//   const handleCancelEdit = () => {
//     setEditingItem(null);
//     setEditForm({
//       name: "",
//       description: "",
//       category: "",
//       price: "",
//       isAvailable: true,
//       tags: [],
//     });
//   };

//   const handleSaveEdit = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Authentication token not found. Please log in again.");
//         return;
//       }
//       const payload = {
//         ...editForm,
//         price: parseFloat(editForm.price),
//       };
//       const res = await axios.put(`http://localhost:8001/api/menus/${editingItem._id}`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setMenuItems(prev =>
//         prev.map(item => item._id === editingItem._id ? res.data : item)
//       );
//       handleCancelEdit();
//       alert("Menu item updated successfully!");
//     } catch (err) {
//       setError("Failed to update menu item: " + (err.response?.data?.message || err.message));
//     }
//   };

//   const handleDeleteItem = async (id) => {
//     if (window.confirm("Are you sure you want to delete this menu item?")) {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("Authentication token not found. Please log in again.");
//           return;
//         }
//         await axios.delete(`http://localhost:8001/api/menus/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setMenuItems(prev => prev.filter(item => item._id !== id));
//         if (editingItem?._id === id) {
//           handleCancelEdit();
//         }
//         alert("Menu item deleted successfully!");
//       } catch (err) {
//         setError("Failed to delete menu item: " + (err.response?.data?.message || err.message));
//       }
//     }
//   };

//   const filteredMenuItems = menuItems.filter((item) => {
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
//     return matchesSearch && matchesCategory;
//   });

//   // Get unique categories from existing menu items
//   const existingCategories = [...new Set(menuItems.map(item => item.category))];

//   if (loading) {
//     return (
//       <div className="p-6 text-center">
//         <div className="animate-pulse">
//           <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
//           <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-5">
//       <div className="flex justify-between items-center">
//         <h3 className="text-lg font-medium text-gray-900">
//           {restaurantName || "Restaurant"} - Menu Items
//         </h3>
//         <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
//           <X size={18} className="text-gray-500" />
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
//           <div className="flex items-center">
//             <AlertCircle className="text-red-500 mr-3" size={20} />
//             <p className="text-red-700 text-sm">{error}</p>
//           </div>
//         </div>
//       )}

//       {!editingItem ? (
//         <>
//           <div className="flex flex-col sm:flex-row gap-3 mb-4">
//             <div className="relative flex-grow">
//               <input
//                 type="text"
//                 placeholder="Search menu items..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             </div>

//             <div className="relative">
//               <select
//                 value={categoryFilter}
//                 onChange={(e) => setCategoryFilter(e.target.value)}
//                 className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg w-full focus:ring-orange-500 focus:border-orange-500"
//               >
//                 <option value="">All Categories</option>
//                 {existingCategories.map((category, idx) => (
//                   <option key={idx} value={category}>
//                     {category.charAt(0).toUpperCase() + category.slice(1)}
//                   </option>
//                 ))}
//               </select>
//               <Filter className="absolute right-3 top-2.5 text-gray-400" size={18} />
//             </div>
//           </div>

//           {filteredMenuItems.length === 0 ? (
//             <div className="bg-gray-50 p-6 rounded-lg text-center">
//               <p className="text-gray-500">
//                 {menuItems.length === 0
//                   ? "No menu items found for this restaurant."
//                   : "No menu items match your search."}
//               </p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {filteredMenuItems.map((item) => (
//                 <div key={item._id} className="py-4">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-grow">
//                       <div className="flex items-center">
//                         <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
//                         {item.isAvailable ? (
//                           <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
//                             Available
//                           </span>
//                         ) : (
//                           <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
//                             Unavailable
//                           </span>
//                         )}
//                       </div>

//                       {item.description && (
//                         <p className="mt-1 text-sm text-gray-600">{item.description}</p>
//                       )}

//                       <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
//                         <span className="flex items-center">
//                           <DollarSign size={14} className="mr-1" />
//                           ${item.price.toFixed(2)}
//                         </span>
//                         <span className="flex items-center">
//                           <Tag size={14} className="mr-1" />
//                           {item.category}
//                         </span>
//                       </div>

//                       {item.tags?.length > 0 && (
//                         <div className="mt-2 flex flex-wrap gap-1">
//                           {item.tags.map((tag, i) => (
//                             <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex space-x-2 ml-4">
//                       <button onClick={() => setEditingItem(item)} className="p-1 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded" title="Edit">
//                         <Edit size={18} />
//                       </button>
//                       <button onClick={() => handleDeleteItem(item._id)} className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded" title="Delete">
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="bg-white p-4 border border-gray-200 rounded shadow-sm">
//           <h4 className="text-lg font-medium mb-4 text-gray-900">Edit Menu Item</h4>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={editForm.name}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Item name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//               <textarea
//                 name="description"
//                 value={editForm.description}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
//                 placeholder="Item description"
//                 rows={3}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                 <select
//                   name="category"
//                   value={editForm.category}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map(cat => (
//                     <option key={cat.value} value={cat.value}>
//                       {cat.icon} {cat.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={editForm.price}
//                   onChange={handleInputChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
//                   placeholder="Price"
//                   step="0.01"
//                   min="0"
//                 />
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <input
//                 type="checkbox"
//                 name="isAvailable"
//                 checked={editForm.isAvailable}
//                 onChange={handleInputChange}
//                 className="text-orange-500 focus:ring-orange-500"
//               />
//               <label className="text-sm font-medium text-gray-700">Available</label>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
//               <div className="flex items-center space-x-2">
//                 <input
//                   type="text"
//                   value={tag}
//                   onChange={(e) => setTag(e.target.value)}
//                   className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
//                   placeholder="Add tag"
//                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
//                 />
//                 <button type="button" onClick={handleAddTag} className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
//                   <Plus size={18} />
//                 </button>
//               </div>

//               <div className="flex flex-wrap mt-2 gap-2">
//                 {editForm.tags.map((t, idx) => (
//                   <span key={idx} className="flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
//                     {t}
//                     <button onClick={() => handleRemoveTag(t)} className="ml-1">
//                       <XCircle size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             <div className="flex space-x-2 justify-end">
//               <button onClick={handleSaveEdit} className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md">
//                 <Save size={18} className="mr-2" /> Save
//               </button>
//               <button onClick={handleCancelEdit} className="flex items-center px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuView;