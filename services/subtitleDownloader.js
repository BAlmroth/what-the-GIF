import { getSubtitles } from "youtube-captions-scraper";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDirectory = path.resolve(__dirname, "../temp");

// Download subtitles YouTube
export async function downloadSubtitles(videoId, language = 'en') {
    try {
        console.log(`Downloading subtitles for video ID: ${videoId} in language: ${language}...`);

        // Get subtitles using youtube-captions-scraper
        const subtitles = await getSubtitles({
            videoID: videoId,
            lang: language
        });

        if (!subtitles || subtitles.length === 0) {
            throw new Error(`No ${language} subtitles found for this video.`);
        }

        // Convert subtitles to SRT format
        const srtContent = convertToSRT(subtitles);

        // Save SRT file to temp directory
        const timestamp = Date.now();
        const filename = `subtitles-${videoId}-${language}-${timestamp}.srt`;
        const filepath = path.join(tempDirectory, filename);

        fs.writeFileSync(filepath, srtContent);

        console.log('Subtitles downloaded and saved to:', filepath);

        return {
            filepath,
            filename,
            language,
            subtitleCount: subtitles.length,
            duration: subtitles[subtitles.length - 1]?.start || 0
        };

    } catch (error) {
        console.error('Error downloading subtitles:', error);
        throw error;
    }
}

// Convert subtitles to SRT format
function convertToSRT(subtitles) {
    let srt = '';

    subtitles.forEach((subtitle, index) => {
        const start = formatTime(subtitle.start);
        const end = formatTime(subtitle.start + subtitle.dur);
        // Decode HTML entities in subtitle text
        const text = subtitle.text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        // Append subtitle entry to SRT content
        srt += `${index + 1}\n`;
        srt += `${start} --> ${end}\n`;
        srt += `${text}\n\n`;
    });

    return srt;
}

// Format time in SRT format (HH:MM:SS,ms)
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    // Pad hours, minutes, seconds, and milliseconds
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// Extract video ID from YouTube URL
export const extractVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^\s&?]+)/);
    return match ? match[1] : null;
};