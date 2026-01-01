// src/pages/admin/AdminWorkingHours.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Clock, Edit2, X } from "lucide-react";

export default function AdminWorkingHours() {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/working-times`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenTime(res.data.open || "09:00");
      setCloseTime(res.data.close || "23:00");
    } catch (err) {
      toast.error("Échec du chargement des horaires");
      // Valeurs par défaut en cas d'erreur
      setOpenTime("09:00");
      setCloseTime("23:00");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation du format HH:MM
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(openTime) || !timeFormat.test(closeTime)) {
      return toast.error("Veuillez entrer des horaires valides au format HH:MM (ex. 09:30)");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/working-times`,
        { open: openTime, close: closeTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Horaires mis à jour avec succès");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de la mise à jour des horaires");
    }
  };

  const formatDisplayTime = (time) => {
    if (!time) return "--:--";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen py-8 px-4 mt-14"
      >
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              Horaires d'Ouverture
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light">
              Définissez les heures d'ouverture et de fermeture quotidiennes de votre restaurant
            </p>
          </div>

          {/* Carte des horaires actuels */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Clock size={40} className="text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Horaires Actuels</h2>
                  <p className="text-gray-600">Affichés sur la page du menu</p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition shadow-lg"
                >
                  <Edit2 size={20} />
                  Modifier les Horaires
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">Chargement...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Ouverture</p>
                  <p className="text-5xl font-bold text-gray-900">
                    {formatDisplayTime(openTime)}
                  </p>
                  <p className="text-lg text-gray-600 mt-2">Format 24h : {openTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Fermeture</p>
                  <p className="text-5xl font-bold text-gray-900">
                    {formatDisplayTime(closeTime)}
                  </p>
                  <p className="text-lg text-gray-600 mt-2">Format 24h : {closeTime}</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal d'édition (Bottom Sheet mobile-first) */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
              >
                <motion.div
                  className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 sm:p-8">
                    {/* Indicateur mobile */}
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 sm:hidden" />

                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl sm:text-3xl font-extralight">Modifier les Horaires</h2>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <X size={28} />
                      </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Heure d'Ouverture (format 24h)
                        </label>
                        <input
                          type="text"
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          placeholder="09:00"
                          className="w-full px-6 py-5 text-xl text-center border border-gray-300 rounded-2xl focus:border-black outline-none"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Exemple : 09:30, 14:00, 08:00
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Heure de Fermeture (format 24h)
                        </label>
                        <input
                          type="text"
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          placeholder="23:00"
                          className="w-full px-6 py-5 text-xl text-center border border-gray-300 rounded-2xl focus:border-black outline-none"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          Exemple : 22:30, 02:00 (nuit tardive)
                        </p>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button
                          type="submit"
                          className="cursor-pointer flex-1 py-5 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="cursor-pointer flex-1 py-5 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition"
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
        </div>
      </motion.section>
    </>
  );
}