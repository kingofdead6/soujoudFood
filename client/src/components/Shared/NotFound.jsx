// src/pages/NotFound.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl"
      >
        {/* Large 404 */}
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-9xl md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#CC5500] to-[#ffae74] leading-none"
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
            Oops! Looks like you've wandered off the menu. The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Decorative Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="my-12"
        >
         
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            to="/"
            className="inline-block px-10 py-5 bg-gradient-to-r from-[#CC5500] to-[#ffae74] text-white text-xl font-bold rounded-2xl hover:from-[#622900] hover:to-[#e5680f] transition shadow-xl"
          >
            Back to Menu
          </Link>
        </motion.div>

     
      </motion.div>
    </div>
  );
}