import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";           
import userRoutes from "./routes/users.js";
import workingTimesRoutes from "./routes/workingtimes.js"; 
import socialMediaRoutes from "./routes/socialMediaRoutes.js";   
import categoryRoutes from "./routes/categoriesRoutes.js"; 

dotenv.config();

const app = express();

// Middleware
app.use(cors({}));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/users", userRoutes);
app.use("/api/working-times", workingTimesRoutes);
app.use("/api/social-media", socialMediaRoutes); 
app.use("/api/categories", categoryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong!",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});