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
      return res.status(400).json({ error: "Please enter a video URL." });
    }

    // Download video
    console.log("Downloading video from YouTube...");
    const video = await downloadYouTubeVideo(videoUrl);
    videoPath = video.filepath;

    // Handle custom subtitles
    if (useSubtitles === "custom" && customSubtitleText) {
      console.log("Creating custom subtitle file...");
      const startTimeSeconds = parseFloat(startTime);
      const durationSeconds = parseFloat(duration);

      subtitlePath = await createCustomSubtitle(
        customSubtitleText,
        startTimeSeconds,
        durationSeconds
      );
    } else if (useSubtitles === "upload" && req.file) {
      console.log("Using uploaded subtitle file...");
      subtitlePath = req.file.path;
    }

    // Convert to GIF
    console.log("Converting video to GIF...");
    const gifResult = await convertVideoToGif(videoPath, {
      startTime,
      duration,
      scaleWidth: 480,
      subtitlePath
    });

    // Save to database
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

  } catch (error) {
    console.error("Error in /convert route:", error);
    
    //user message based on error
    let userMessage = "Failed to create GIF. Please try again.";
    
    if (error.message.includes("Could not download video")) {
      userMessage = "Could not download video. Please check the URL and try again.";
    } else if (error.message.includes("Failed to apply subtitles")) {
      userMessage = "Failed to apply subtitles. Please try again.";
    } else if (error.message.includes("Failed to convert video to GIF")) {
      userMessage = "Failed to convert video to GIF. Please try again.";
    }
    
    res.status(500).json({ error: userMessage });
  }
});

export default router;