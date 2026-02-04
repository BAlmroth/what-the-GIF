import express from "express";
import { downloadYouTubeVideo } from "../services/youtubeDownloader.js";
import { convertVideoToGif } from "../services/gifConverter.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    const video = await downloadYouTubeVideo(videoUrl);

    const gifUrl = await convertVideoToGif(video.filepath, null, {
      startTime: "00:00:00",
      duration: "5",
      scaleWidth: 480,
    });

    res.json({ gifUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
