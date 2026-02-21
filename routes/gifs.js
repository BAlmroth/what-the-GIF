import express from "express";
import GifModel from "./../schemas/Gifs.js";
import cloudinary  from "../config/cloudinary.js";

/** @type {import('mongoose').Model<any>} */
const Gif = GifModel;

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        error: "insert title and url",
      });
    }

    const gif = await Gif.create({ title, url });

    res.status(201).json({ data: gif });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET gifs from db
router.get("/", async (req, res) => {
  try {
    const gifs = await Gif.find().sort({ createdAt: -1 });
    res.json({ data: gifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete gif by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Find the gif
    const gif = await Gif.findById(id);

    if (!gif) {
      return res.status(404).json({
        success: false,
        error: "Gif not found"
      }); 
    }

    console.log(`Deleting gif with public ID: ${gif.slug}`);

    // Delete from Cloudinary
    if (gif.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(gif.cloudinaryId);
        console.log(`Successfully deleted from Cloudinary: ${gif.cloudinaryId}`);
      } catch (cloudErr) {
        console.error("Cloudinary deletion error:", cloudinaryErr);
      }
    }

    // Delete from MongoDB
    await Gif.findByIdAndDelete(id);
    console.log(`Deleted gif from database with ID: ${id}`);

    res.json({
      success: true,
      message: "Gif deleted successfully",
      deletedGif: {
        id: gif._id,
        title: gif.title,
        slug: gif.slug,
      }
    });

  } catch (err) {
    console.error("Error deleting gif:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
