import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash ,FaLock } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Please enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email format.";
    if (!password) e.password = "Please enter your password.";
    else if (password.length < 6) e.password = "Password is too short (minimum 6 characters).";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email,
          password,
        });
        const { token, usertype } = response.data;
        if (remember) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }
        window.dispatchEvent(new Event("authChanged"));
        setErrors({});
        if (usertype === "admin" || usertype === "superadmin") {
          navigate("/admin/dashboard");
        } else {
          setErrors({ form: "You are not authorized to access the admin panel." });
        }
      } catch (error) {
        setErrors({ form: error.response?.data?.message || "Login failed. Please check your credentials." });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-[#CC5500] to-[#ffae74]"></div>

          <div className="p-10">
           
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Admin Login</h1>
            </div>

            {/* General Error */}
            {errors.form && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center">
                {errors.form}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className={`w-full pl-14 pr-5 py-5 rounded-2xl border-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <div className="absolute inset-y-0 left-5 flex items-center text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-14 pr-14 py-5 rounded-2xl border-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#CC5500] transition ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    autoComplete="current-password"
                  />
                  <div className="absolute inset-y-0 left-5 flex items-center text-gray-500">
                    <FaLock className="w-6 h-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute inset-y-0 right-5 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash className="w-6 h-6" /> : <FaEye className="w-6 h-6" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full py-6 mt-8 bg-gradient-to-r from-[#CC5500] to-[#ffae74] text-white text-xl font-bold rounded-2xl hover:from-[#622900] hover:to-[#e5680f] transition shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

           
          </div>
        </div>
      </motion.div>
    </div>
  );
}