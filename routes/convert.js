import express from "express";
import { convertLimiter } from "../middleware/rateLimiter.js";
import multer from "multer";
import Gif from "../schemas/Gifs.js";
import { downloadYouTubeVideo } from "../services/youtubeDownloader.js";
import { convertVideoToGif } from "../services/gifConverter.js";
import { createCustomSubtitle } from "../services/subtitleApplier.js";
import { generateUniqueSlug } from "../utils/slugify.js";

const router = express.Router();

// Configure multer for parsing subtitle file uploads
const upload = multer({ dest: 'temp/' });

router.post("/", convertLimiter, upload.single('subtitleFile'), async (req, res) => {
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
    try {
      const video = await downloadYouTubeVideo(videoUrl);
      videoPath = video.filepath;
    } catch (err) {
      console.error("YouTube download error:", err);
      throw new Error(`Failed to download video: ${err.message}`);
    }

    // Handle custom subtitles
    if (useSubtitles === "custom" && customSubtitleText) {
      console.log("Creating custom subtitle file...");
      try {
        const startTimeSeconds = parseFloat(startTime);
        const durationSeconds = parseFloat(duration);

        subtitlePath = await createCustomSubtitle(
          customSubtitleText,
          startTimeSeconds,
          durationSeconds
        );
      } catch (err) {
        console.error("Custom subtitle creation error:", err);
        throw new Error(`Failed to create custom subtitle: ${err.message}`);
      }
    } else if (useSubtitles === "upload" && req.file) {
      console.log("Using uploaded subtitle file...");
      subtitlePath = req.file.path;
    }

    console.log("Converting video to GIF...");
    let gifResult;
    try {
      gifResult = await convertVideoToGif(videoPath, {
        startTime,
        duration,
        scaleWidth: 480,
        subtitlePath
      });
    } catch (err) {
      console.error("GIF conversion error:", err);
      throw new Error(`Failed to convert video to GIF: ${err.message}`);
    }

    console.log('Saving to database...');

    // Generate better default title if not provided
    let gifTitle = title?.trim();
    if (!gifTitle || gifTitle === "") {
      const date = new Date().toISOString().split('T')[0];
      const time = Date.now().toString().slice(-4);
      gifTitle = `GIF-${date}-${time}`;
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(gifTitle, Gif);
    console.log(`Generated slug: "${slug}" for title: "${gifTitle}"`);

    try {
      const newGif = new Gif({
        title: gifTitle,
        slug: slug,
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
        slug: newGif.slug,
        shareUrl: `${req.protocol}://${req.get('host')}/${slug}`,
        hasSubtitles: subtitlePath !== null
      });
    } catch (err) {
      console.error("Database save error:", err);
      throw new Error(`Failed to save GIF to database: ${err.message}`);
    }
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