import express from "express";
import { apiLimiter, convertLimiter } from "./middleware/rateLimiter.js";
import connectDB from "./config/database.js";
import gifRoutes from "./routes/gifs.js";
import gifConverterRoutes from "./routes/convert.js";
import gifViewRoutes from "./routes/gifView.js";
import path from 'path';
import { fileURLToPath } from "url";

// Initialize Express app
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB and start server
await connectDB();

// API routes with rate limiting
app.use("/gifs", apiLimiter, gifRoutes);
app.use("/convert", convertLimiter, gifConverterRoutes);
app.use("/api", gifViewRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

// GIF by slug route
app.get("/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "view-gif.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
