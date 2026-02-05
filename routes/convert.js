import express from "express";
import Gif from "../schemas/Gifs.js";
import { downloadYouTubeVideo } from "../services/youtubeDownloader.js";
import { convertVideoToGif } from "../services/gifConverter.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { 
      videoUrl,
      title, 
      startTime = "00:00:00", 
      duration = "5",
    } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    console.log("Downloading video from YouTube...");
    const video = await downloadYouTubeVideo(videoUrl);

    console.log("Converting video to GIF...");
    const gifUrl = await convertVideoToGif(video.filepath, null, {
      startTime,
      duration,
      scaleWidth: 480,
    });

    // Save GIF info to database
    console.log("Saving GIF info to database...");
    const newGif = new Gif({
      title: title || 'Untitled GIF',
      url: gifUrl,
      youtubeUrl: videoUrl,
      startTime, 
      duration
    });

    await newGif.save();

    console.log("Done!");
    res.json({
      gifUrl, 
      gifId: newGif._id
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;