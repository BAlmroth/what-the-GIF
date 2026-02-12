import express from "express";
import GifModel from "./../schemas/Gifs.js";

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

export default router;
