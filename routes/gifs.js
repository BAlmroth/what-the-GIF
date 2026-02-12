import express from "express";
import GifModel from "./../schemas/Gifs.js";

/** @type {import('mongoose').Model<any>} */
const Gif = GifModel;

const router = express.Router();

// GET gifs from db
router.get("/", async (req, res) => {
  try {
    const gifs = await Gif.find().sort({ createdAt: -1 });
    res.json({ data: gifs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
