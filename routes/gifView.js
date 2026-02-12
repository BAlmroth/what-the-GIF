import express from "express";
import Gif from "../schemas/Gifs.js";

const router = express.Router();

// Get GIF details by slug
router.get("/gif/:slug", async (req, res) => {
    try {
        const gif = await Gif.findOne({ slug: req.params.slug });

        if (!gif) {
            return res.status(404).json({ error: "GIF not found" });
        }

        // Increment view count
        gif.views = (gif.views || 0) + 1;
        await gif.save();

        // Return GIF details
        res.json({
            title: gif.title,
            slug: gif.slug,
            url: gif.url,
            hasSubtitles: gif.hasSubtitles,
            views: gif.views,
            createdAt: gif.createdAt,
            fileSize: gif.fileSize,
            width: gif.width,
            height: gif.height
        });
    } catch (err) {
        console.error("Error fetching GIF details:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;