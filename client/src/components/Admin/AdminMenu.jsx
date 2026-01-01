"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon, ToggleLeft, ToggleRight } from "lucide-react";
import { API_BASE_URL } from "../../../api";

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states (bilingual)
  const [formData, setFormData] = useState({
    name_ar: "",
    name_fr: "",
    description_ar: "",
    description_fr: "",
    price: "",
    category_ar: "",
    category_fr: "",
    image: null,
    showOnMainPage: true,
  });
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetchMenuAndCategories();
  }, []);

  const fetchMenuAndCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/menu/admin-menu`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setMenuItems(menuRes.data);
      setCategories(catRes.data);
    } catch (err) {
      toast.error("Échec du chargement des éléments du menu");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  useEffect(() => {
    let filtered = menuItems;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name_fr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item =>
        item.category_ar === selectedCategory || item.category_fr === selectedCategory
      );
    }
    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      name_fr: "",
      description_ar: "",
      description_fr: "",
      price: "",
      category_ar: "",
      category_fr: "",
      image: null,
      showOnMainPage: true,
    });
    setImagePreview("");
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name_ar || !formData.name_fr || !formData.price || !formData.category_ar || !formData.category_fr) {
    return toast.error("Tous les champs obligatoires doivent être remplis");
  }

  const submitData = new FormData();
  submitData.append("name_ar", formData.name_ar.trim());
  submitData.append("name_fr", formData.name_fr.trim());
  submitData.append("description_ar", formData.description_ar.trim());
  submitData.append("description_fr", formData.description_fr.trim());
  submitData.append("price", formData.price);
  submitData.append("category_ar", formData.category_ar.trim());
  submitData.append("category_fr", formData.category_fr.trim());
  submitData.append("showOnMainPage", formData.showOnMainPage);
  if (formData.image) submitData.append("image", formData.image);

  try {
    setIsSubmitting(true); // ⬅️ start loading
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    if (selectedItem) {
      await axios.put(`${API_BASE_URL}/menu/${selectedItem._id}`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Élément modifié avec succès");
      setShowEditModal(false);
    } else {
      await axios.post(`${API_BASE_URL}/menu`, submitData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Élément ajouté avec succès");
      setShowAddModal(false);
    }

    resetForm();
    fetchMenuAndCategories();
  } catch (err) {
    toast.error(err.response?.data?.message || "Échec de l'enregistrement");
  } finally {
    setIsSubmitting(false); // ⬅️ stop loading
  }
};


  const handleDelete = async (id, name_fr) => {
    if (!window.confirm(`Supprimer "${name_fr}" du menu ?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Élément supprimé avec succès");
      fetchMenuAndCategories();
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/menu/${id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Visibilité mise à jour");
      fetchMenuAndCategories();
    } catch (err) {
      toast.error("Échec de la mise à jour de visibilité");
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name_ar: item.name_ar,
      name_fr: item.name_fr,
      description_ar: item.description_ar,
      description_fr: item.description_fr,
      price: item.price,
      category_ar: item.category_ar,
      category_fr: item.category_fr,
      image: null,
      showOnMainPage: item.showOnMainPage,
    });
    setImagePreview(item.image);
    setShowEditModal(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              Gérer le Menu
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light">
              Ajouter, modifier et organiser les éléments du menu de votre restaurant
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="cursor-pointer flex items-center justify-center gap-3 px-8 py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={28} />
              Ajouter un Nouvel Élément
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher des éléments du menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 border border-gray-300 rounded-2xl focus:border-black outline-none text-lg"
                />
              </div>

              {/* Category Filter - Now shows FR - AR side by side */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="cursor-pointer px-6 py-5 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-lg font-medium"
              >
                <option value="All">Toutes les Catégories</option>
                {categories.map(cat => {
                  const displayText = `${cat.name_fr} - ${cat.name_ar}`;
                  return (
                    <option key={cat._id} value={cat.name_fr}>
                      {displayText}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Menu Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">Chargement des éléments du menu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-3xl text-gray-400 font-light mb-6">
                {searchTerm || selectedCategory !== "All" ? "Aucun élément trouvé" : "Votre menu est vide"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer text-xl text-black underline font-medium hover:text-gray-700"
              >
                Ajouter votre premier élément
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden group"
                >
                  <div className="relative h-64">
                    <img
                      src={item.image}
                      alt={item.name_fr}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                      <button
                        onClick={() => openEditModal(item)}
                        className="cursor-pointer p-4 bg-white rounded-full hover:bg-gray-100 transition"
                      >
                        <Edit2 size={24} className="text-gray-800" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.name_fr)}
                        className="cursor-pointer p-4 bg-red-600 rounded-full hover:bg-red-700 transition"
                      >
                        <Trash2 size={24} className="text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name_fr}</h3>
                    <p className="text-lg text-gray-700 italic mb-3">({item.name_ar})</p>
                    <p className="text-gray-600 text-sm mb-4">
                      Description : <span className="font-medium">{item.description_fr} - {item.description_ar}</span>
                    </p>

                    <p className="text-gray-600 text-sm mb-4">
                      Catégorie : <span className="font-medium">{item.category_fr} - {item.category_ar}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-gray-900">
                        {Number(item.price)} DZD
                      </span>
                      <button
                        onClick={() => handleToggleVisibility(item._id)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl transition"
                      >
                        {item.showOnMainPage ? (
                          <ToggleRight size={32} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={32} className="text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                          {item.showOnMainPage ? "Visible" : "Masqué"}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                showAddModal && setShowAddModal(false);
                showEditModal && setShowEditModal(false);
              }}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extralight">
                      {showAddModal ? "Ajouter un Nouvel Élément" : "Modifier l'Élément"}
                    </h2>
                    <button
                      onClick={() => {
                        showAddModal && setShowAddModal(false);
                        showEditModal && setShowEditModal(false);
                      }}
                      className="cursor-pointer p-3 hover:bg-gray-100 rounded-full transition"
                    >
                      <X size={32} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Nom de l'élément (Français)
                        </label>
                        <input
                          type="text"
                          value={formData.name_fr}
                          onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Nom de l'élément (Arabe)
                        </label>
                        <input
                          type="text"
                          value={formData.name_ar}
                          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                          dir="rtl"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          description de l'élément (Français) (optionnel)
                        </label>
                        <input
                          type="text"
                          value={formData.description_fr}
                          onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          description de l'élément (Arabe) (optionnel)
                        </label>
                        <input
                          type="text"
                          value={formData.description_ar}
                          onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Prix (DZD)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none"
                          required
                        />
                      </div>

                      {/* Category Selector with FR - AR display */}
                      <div>
                        <label className="block text-lg font-medium text-gray-700 mb-3">
                          Catégorie
                        </label>
                        <select
                          value={formData.category_fr}
                          onChange={(e) => {
                            const selectedCat = categories.find(c => c.name_fr === e.target.value);
                            if (selectedCat) {
                              setFormData({
                                ...formData,
                                category_fr: selectedCat.name_fr,
                                category_ar: selectedCat.name_ar,
                              });
                            }
                          }}
                          className="cursor-pointer w-full px-6 py-5 text-xl border border-gray-300 rounded-2xl focus:border-black outline-none bg-white"
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat.name_fr}>
                              {cat.name_fr} - {cat.name_ar}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-3">
                        Image de l'élément {showEditModal && "(Optionnel - laisser vide pour conserver l'actuelle)"}
                      </label>
                      <div className="flex items-center gap-6">
                        {imagePreview && (
                          <img src={imagePreview} alt="Aperçu" className="w-32 h-32 object-cover rounded-2xl shadow-lg" />
                        )}
                        <label className="cursor-pointer flex items-center gap-4 px-8 py-6 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                          <ImageIcon size={32} className="text-gray-600" />
                          <span className="text-lg font-medium">Choisir une Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="visibility"
                        checked={formData.showOnMainPage}
                        onChange={(e) => setFormData({ ...formData, showOnMainPage: e.target.checked })}
                        className="w-6 h-6 rounded"
                      />
                      <label htmlFor="visibility" className="text-lg font-medium text-gray-700">
                        Afficher sur la page principale du menu
                      </label>
                    </div>

                    <div className="flex gap-6 pt-8">
                      <button
  type="submit"
  className="cursor-pointer flex-1 py-6 bg-black text-white text-xl font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg"
  disabled={isSubmitting} // ⬅️ disable while submitting
>
  {isSubmitting
    ? showAddModal
      ? "Ajout en cours..."
      : "Enregistrement..."
    : showAddModal
      ? "Ajouter l'Élément"
      : "Enregistrer les Modifications"}
</button>

                      <button
                        type="button"
                        onClick={() => {
                          showAddModal && setShowAddModal(false);
                          showEditModal && setShowEditModal(false);
                        }}
                        className="cursor-pointer flex-1 py-6 border-2 border-gray-300 text-xl font-bold rounded-2xl hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
}