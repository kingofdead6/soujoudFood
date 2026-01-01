// src/pages/admin/AdminUsers.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from "../../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, Search, Edit, Trash2, Shield, ShieldCheck, Key, X } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserType, setCurrentUserType] = useState("");
  const [currentUserId, setCurrentUserId] = useState(""); // Pour éviter de se supprimer soi-même

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm, setCreateForm] = useState({ email: "", password: "", usertype: "admin" });
  const [editForm, setEditForm] = useState({ email: "", usertype: "admin" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    fetchCurrentUserTypeAndUsers();
  }, []);

  const fetchCurrentUserTypeAndUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserType(decoded.usertype);
      setCurrentUserId(decoded.id || decoded.userId || decoded._id);

      const res = await axios.get(`${API_BASE_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const adminUsers = res.data.filter(u => u.usertype === "admin" || u.usertype === "superadmin");
      setUsers(adminUsers);
    } catch (err) {
      toast.error("Échec du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(u =>
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole) filtered = filtered.filter(u => u.usertype === filterRole);
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createForm.password !== passwordForm.confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }
    if (createForm.password.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/auth/register`, createForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Administrateur créé avec succès");
      setShowCreateModal(false);
      setCreateForm({ email: "", password: "", usertype: "admin" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      fetchCurrentUserTypeAndUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de la création de l'administrateur");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Empêcher la rétrogradation du dernier superadmin
    if (selectedUser.usertype === "superadmin" && editForm.usertype !== "superadmin") {
      const superadmins = users.filter(u => u.usertype === "superadmin");
      if (superadmins.length === 1) {
        return toast.error("Impossible : il doit toujours exister au moins un Super Admin");
      }
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/auth/users/${selectedUser._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Utilisateur mis à jour avec succès");
      setShowEditModal(false);
      fetchCurrentUserTypeAndUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Échec de la mise à jour");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/auth/users/${selectedUser._id}/password`,
        { password: passwordForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Mot de passe modifié avec succès");
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error("Échec du changement de mot de passe");
    }
  };

  const handleDelete = async (id, name) => {
    const userToDelete = users.find(u => u._id === id);

    // Empêcher la suppression du dernier superadmin
    if (userToDelete.usertype === "superadmin") {
      const superadmins = users.filter(u => u.usertype === "superadmin");
      if (superadmins.length === 1) {
        return toast.error("Impossible de supprimer : il doit toujours exister au moins un Super Admin");
      }
    }

    // Empêcher un utilisateur de se supprimer lui-même
    if (id === currentUserId) {
      return toast.error("Vous ne pouvez pas supprimer votre propre compte");
    }

    if (!window.confirm(`Supprimer définitivement l'administrateur "${name || userToDelete.email}" ?`)) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Administrateur supprimé avec succès");
      fetchCurrentUserTypeAndUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Impossible de supprimer cet utilisateur");
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
          {/* En-tête */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-wider text-gray-900">
              Gérer les Administrateurs
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Créer et gérer les comptes administrateurs avec différents niveaux de permissions
            </p>
          </div>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => setShowCreateModal(true)}
              className="cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition shadow-lg text-lg"
            >
              <Plus size={24} />
              Créer un Nouvel Administrateur
            </button>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-base font-medium"
              >
                <option value="">Tous les Rôles</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          </div>

          {/* Grille des utilisateurs */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">Chargement des administrateurs...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl sm:text-3xl text-gray-400 font-light">Aucun administrateur trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden group"
                >
                  <div className="p-6 text-center space-y-5">
                    <div className="flex justify-center">
                      {user.usertype === "superadmin" ? (
                        <ShieldCheck size={60} className="text-purple-600" />
                      ) : (
                        <Shield size={60} className="text-blue-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user.name || "Sans nom"}</h3>
                      <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    </div>

                    <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold text-white ${
                      user.usertype === "superadmin" 
                        ? "bg-gradient-to-r from-purple-600 to-purple-700" 
                        : "bg-gradient-to-r from-blue-600 to-blue-700"
                    }`}>
                      {user.usertype === "superadmin" ? "Super Admin" : "Admin"}
                    </span>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setEditForm({ email: user.email, usertype: user.usertype });
                          setShowEditModal(true);
                        }}
                        className="cursor-pointer flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition"
                      >
                        <Edit size={18} /> Modifier
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                        className="cursor-pointer flex-1 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition"
                      >
                        <Key size={18} /> Changer le mot de passe
                      </button>
                    </div>

                    {/* Bouton Supprimer – uniquement pour superadmin + protections */}
                    {currentUserType === "superadmin" && (
                      <button
                        onClick={() => handleDelete(user._id, user.name || user.email)}
                        disabled={user._id === currentUserId} // Désactiver si c'est soi-même
                        className={`cursor-pointer w-full py-3 text-white rounded-xl  transition font-medium text-sm flex items-center justify-center gap-2 mt-3 ${
                          user._id === currentUserId 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <Trash2 size={18} /> Supprimer
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {/* Créer un Admin */}
          {showCreateModal && (
            <Modal onClose={() => setShowCreateModal(false)} title="Créer un Nouvel Administrateur">
              <form onSubmit={handleCreate} className="space-y-6">
                <Input label="Adresse email" type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
                <Input label="Mot de passe" type="password" value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required minLength={6} />
                <Input label="Confirmer le mot de passe" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                <Select label="Rôle" value={createForm.usertype} onChange={e => setCreateForm({ ...createForm, usertype: e.target.value })}>
                  <option value="admin">Admin</option>
                  {currentUserType === "superadmin" && <option value="superadmin">Super Admin</option>}
                </Select>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="cursor-pointer flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition">
                    Créer l'Administrateur
                  </button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="cursor-pointer flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Modifier un Utilisateur */}
          {showEditModal && selectedUser && (
            <Modal onClose={() => setShowEditModal(false)} title="Modifier l'Administrateur">
              <form onSubmit={handleUpdate} className="space-y-6">
                <Input label="Adresse email" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                <Select label="Rôle" value={editForm.usertype} onChange={e => setEditForm({ ...editForm, usertype: e.target.value })}>
                  <option value="admin">Admin</option>
                  {currentUserType === "superadmin" && <option value="superadmin">Super Admin</option>}
                </Select>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="cursor-pointer flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition">
                    Mettre à jour
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="cursor-pointer flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </form>
            </Modal>
          )}

          {/* Changer le mot de passe */}
          {showPasswordModal && selectedUser && (
            <Modal onClose={() => setShowPasswordModal(false)} title="Changer le Mot de Passe">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Input label="Nouveau mot de passe" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required minLength={6} />
                <Input label="Confirmer le nouveau mot de passe" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="cursor-pointer flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition">
                    Changer le mot de passe
                  </button>
                  <button type="button" onClick={() => setShowPasswordModal(false)} className="cursor-pointer flex-1 py-4 border-2 border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition">
                    Annuler
                  </button>
                </div>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </motion.section>
    </>
  );
}

// Composant Modal réutilisable
function Modal({ children, title, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extralight">{title}</h2>
            <button onClick={onClose} className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition">
              <X size={28} />
            </button>
          </div>
          <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto -mt-10 mb-6" />
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Composants Input & Select réutilisables
function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none text-base"
        {...props}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-black outline-none bg-white text-base"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}