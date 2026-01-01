// src/pages/admin/AdminSocialMedia.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  MessageCircle,
  Music,
  Linkedin,
  Edit2,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { API_BASE_URL } from "../../../api";

// Toutes les plateformes supportées
const ALL_PLATFORMS = [
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "whatsapp",
  "tiktok",
  "linkedin",
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  whatsapp: MessageCircle,
  tiktok: Music,
  linkedin: Linkedin,
};

const platformColors = {
  instagram: "from-pink-500 to-purple-600",
  facebook: "from-blue-600 to-blue-800",
  youtube: "from-red-600 to-red-800",
  twitter: "from-sky-500 to-sky-700",
  whatsapp: "from-green-500 to-green-700",
  tiktok: "from-black to-gray-900",
  linkedin: "from-blue-700 to-blue-900",
};

const platformNamesFr = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  twitter: "Twitter / X",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

export default function AdminSocialMedia() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // États du modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [formData, setFormData] = useState({ url: "", isActive: true });

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/social-media/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assurer que toutes les plateformes apparaissent (même si pas encore enregistrées)
      const existingPlatforms = res.data.map((link) => link.platform);
      const allLinks = ALL_PLATFORMS.map((platform) => {
        const existing = res.data.find((link) => link.platform === platform);
        return (
          existing || {
            platform,
            url: "",
            isActive: false,
          }
        );
      });
      setLinks(allLinks);
    } catch (err) {
      toast.error("Échec du chargement des liens réseaux sociaux");
      // Fallback : afficher les plateformes vides
      setLinks(
        ALL_PLATFORMS.map((platform) => ({
          platform,
          url: "",
          isActive: false,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (platformObj) => {
    setSelectedPlatform(platformObj);
    setFormData({
      url: platformObj.url || "",
      isActive: platformObj.isActive || false,
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmedUrl = formData.url.trim();

    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      return toast.error("L'URL doit commencer par http:// ou https://");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/social-media/${selectedPlatform.platform}`,
        {
          platform: selectedPlatform.platform,
          url: trimmedUrl,
          isActive: formData.isActive,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(
        trimmedUrl
          ? "Lien mis à jour avec succès"
          : "Lien désactivé (masqué sur le site)"
      );
      setShowEditModal(false);
      fetchSocialLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de la mise à jour du lien");
    }
  };

  const handleDelete = async (platform) => {
    const platformName = platformNamesFr[platform] || platform;
    if (!window.confirm(`Supprimer définitivement le lien ${platformName} ?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/social-media/${platform}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Lien supprimé définitivement");
      fetchSocialLinks();
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  const getPlatformIcon = (platform) => {
    const Icon = platformIcons[platform];
    return <Icon size={48} className="text-white" />;
  };

  const getGradient = (platform) => platformColors[platform] || "from-gray-600 to-gray-800";

  const getPlatformNameFr = (platform) => platformNamesFr[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-wider text-gray-900">
              Réseaux Sociaux
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 font-light">
              Connectez votre restaurant au monde
            </p>
          </div>

          {/* Grille des plateformes */}
          {loading ? (
            <div className="text-center py-32">
              <p className="text-3xl text-gray-500">Chargement des plateformes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-10">
              {links.map((link) => {
                const hasUrl = link.url && link.url.trim() !== "";
                return (
                  <motion.div
                    key={link.platform}
                    whileHover={{ y: -12, scale: 1.05 }}
                    className="group relative cursor-pointer"
                    onClick={() => openEditModal(link)}
                  >
                    <div
                      className={`relative bg-gradient-to-br ${getGradient(
                        link.platform
                      )} rounded-3xl shadow-2xl p-10 text-center transition-all duration-500 h-72 flex flex-col justify-between ${
                        !link.isActive || !hasUrl ? "opacity-70 grayscale" : ""
                      }`}
                    >
                      {/* Icône */}
                      <div className="flex justify-center">
                        {getPlatformIcon(link.platform)}
                      </div>

                      {/* Nom de la plateforme */}
                      <h3 className="text-2xl font-bold text-white">
                        {getPlatformNameFr(link.platform)}
                      </h3>

                      {/* Aperçu URL */}
                      <p className="text-white/80 text-sm mt-4 line-clamp-2 break-all">
                        {hasUrl ? link.url : "Non connecté"}
                      </p>

                      {/* Overlay au survol */}
                      <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <div className="text-white text-center">
                          <Edit2 size={36} className="mx-auto mb-3" />
                          <p className="text-lg font-medium">Cliquer pour modifier</p>
                        </div>
                      </div>

                      {/* Indicateur actif */}
                      <div className="absolute top-6 right-6">
                        {link.isActive && hasUrl ? (
                          <ToggleRight size={36} className="text-white drop-shadow-lg" />
                        ) : (
                          <ToggleLeft size={36} className="text-white/50" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Modal de modification */}
          <AnimatePresence>
            {showEditModal && selectedPlatform && (
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
              >
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                  initial={{ scale: 0.9, y: 100 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 100 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bg-gradient-to-br ${getGradient(selectedPlatform.platform)} p-10 text-white text-center`}>
                    <div className="flex justify-center mb-6">
                      {getPlatformIcon(selectedPlatform.platform)}
                    </div>
                    <h2 className="text-4xl font-bold">
                      {getPlatformNameFr(selectedPlatform.platform)}
                    </h2>
                  </div>

                  <div className="p-10">
                    <form onSubmit={handleSave} className="space-y-8">
                      <div>
                        <label className="block text-xl font-medium text-gray-700 mb-4">
                          URL du profil
                        </label>
                        <input
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder={`https://${selectedPlatform.platform}.com/votrerestaurant`}
                          className="w-full px-8 py-6 text-xl border-2 border-gray-300 rounded-2xl focus:border-black outline-none transition"
                        />
                        <p className="text-sm text-gray-500 mt-3">
                          Laisser vide et décocher « Afficher » pour masquer cette plateforme
                        </p>
                      </div>

                      <div className="flex items-center gap-5">
                        <input
                          type="checkbox"
                          id="active"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-8 h-8 rounded accent-black"
                        />
                        <label htmlFor="active" className="text-xl font-medium text-gray-700">
                          Afficher sur le site
                        </label>
                      </div>

                      <div className="flex gap-6 pt-8">
                        <button
                          type="submit"
                          className="cursor-pointer flex-1 py-6 bg-black text-white text-2xl font-bold rounded-2xl hover:bg-gray-800 transition shadow-xl"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditModal(false)}
                          className="cursor-pointer flex-1 py-6 border-4 border-gray-300 text-2xl font-bold rounded-2xl hover:bg-gray-100 transition"
                        >
                          Annuler
                        </button>
                      </div>

                      {selectedPlatform.url && (
                        <div className="pt-6 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedPlatform.platform)}
                            className="cursor-pointer text-red-600 hover:text-red-700 font-medium text-lg underline"
                          >
                            Supprimer définitivement ce lien
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </>
  );
}