import express from "express";
import multer from "multer";
import Gif from "../schemas/Gifs.js";
import { downloadYouTubeVideo } from "../services/youtubeDownloader.js";
import { convertVideoToGif } from "../services/gifConverter.js";
import { createCustomSubtitle } from "../services/subtitleApplier.js";

const router = express.Router();

// Configure multer for parsing subtitle file uploads
const upload = multer({ dest: 'temp/' });

router.post("/", upload.single('subtitleFile'), async (req, res) => {
  let subtitlePath = null;
  let videoPath = null;

  try {
    const {
      videoUrl,
      title,
      startTime = "0",
      duration = "5",
      useSubtitles = "none",
      customSubtitleText = ""
    } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    console.log("Downloading video from YouTube...");
    const video = await downloadYouTubeVideo(videoUrl);
    videoPath = video.filepath;

    // Handle custom subtitles
    if (useSubtitles === "custom" && customSubtitleText) {
      console.log("Creating custom subtitle file...");
      subtitlePath = await createCustomSubtitle(
        customSubtitleText,
        parseTime(startTime),
        parseFloat(duration)
      );
    } else if (useSubtitles === "upload" && req.file) {
      console.log("Using uploaded subtitle file...");
      subtitlePath = req.file.path;
    }

    console.log("Converting video to GIF...");
    const gifResult = await convertVideoToGif(videoPath, {
      startTime,
      duration,
      scaleWidth: 480,
      subtitlePath
    });

    console.log('Saving to database...');
    const newGif = new Gif({
      title: title || 'Untitled GIF',
      url: gifResult.url,
      cloudinaryId: gifResult.cloudinaryId,
      youtubeUrl: videoUrl,
      startTime,
      duration,
      fileSize: gifResult.fileSize,
      width: gifResult.width,
      height: gifResult.height,
      hasSubtitles: subtitlePath !== null
    });
    await newGif.save();

    res.json({
      gifUrl: gifResult.url,
      gifId: newGif._id,
      hasSubtitles: subtitlePath !== null
    });
  } catch (err) {
    console.error("Error in /convert route:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to parse time string (e.g. "00:01:30") into seconds
function parseTime(timeStr) {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export default router;