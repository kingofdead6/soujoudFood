// src/pages/admin/AdminCategories.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Trash2, X } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Bilingual form
  const [newCategory, setNewCategory] = useState({
    name_ar: "",
    name_fr: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const term = (searchTerm || "").trim().toLowerCase();

    if (!term) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(cat => {
      const ar = (cat.name_ar || "").trim();
      const fr = (cat.name_fr || "").trim().toLowerCase();
      return ar.includes(term) || fr.includes(term);
    });

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      toast.error("Échec du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name_ar.trim() || !newCategory.name_fr.trim()) {
      return toast.error("Les noms en arabe et en français sont obligatoires");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/categories`,
        {
          name_ar: newCategory.name_ar.trim(),
          name_fr: newCategory.name_fr.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, res.data]);
      setNewCategory({ name_ar: "", name_fr: "" });
      setShowAddModal(false);
      toast.success("Catégorie ajoutée avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de l'ajout de la catégorie");
    }
  };

  const handleDeleteCategory = async (id, name_fr, name_ar) => {
    if (!window.confirm(`Supprimer la catégorie "${name_fr}" - "${name_ar}" ?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((cat) => cat._id !== id));
      toast.success("Catégorie supprimée avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de la suppression de la catégorie");
    }
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              Gérer les Catégories
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light">
              Organisez votre menu avec des noms de catégories en arabe et en français
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => setShowAddModal(true)}
              className="cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={24} />
              Ajouter une Nouvelle Catégorie
            </button>

            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher des catégories (AR/FR)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
              />
            </div>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">Chargement des catégories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl sm:text-3xl text-gray-400 font-light mb-6">
                {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie pour le moment"}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="cursor-pointer text-lg text-black underline font-medium hover:text-gray-700 transition"
              >
                Ajouter votre première catégorie
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <motion.div
                  key={category._id}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 p-6 text-center"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name_fr}
                  </h3>
                  <p className="text-lg text-gray-600 italic">
                    ({category.name_ar})
                  </p>

                  <button
                    onClick={() => handleDeleteCategory(category._id, category.name_fr, category.name_ar)}
                    className="cursor-pointer absolute top-3 right-3 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center  justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                className="bg-white rounded-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extralight">Ajouter une Nouvelle Catégorie</h2>
                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X size={28} />
                    </button>
                  </div>

                  <form onSubmit={handleAddCategory} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la catégorie (Français)
                      </label>
                      <input
                        type="text"
                        value={newCategory.name_fr}
                        onChange={(e) => setNewCategory({ ...newCategory, name_fr: e.target.value })}
                        placeholder="ex: Entrées"
                        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de la catégorie (Arabe)
                      </label>
                      <input
                        type="text"
                        value={newCategory.name_ar}
                        onChange={(e) => setNewCategory({ ...newCategory, name_ar: e.target.value })}
                        placeholder="مثلاً: مقبلات"
                        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
                        dir="rtl"
                        required
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition"
                      >
                        Créer la Catégorie
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition"
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