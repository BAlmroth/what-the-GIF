import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDirectory = path.resolve(__dirname, '../downloads/ytdl-downloads');

// Create directory if it doesn't exist
if (!fs.existsSync(downloadDirectory)) {
    fs.mkdirSync(downloadDirectory, { recursive: true });
}

const videoUrl = 'https://youtu.be/FUKmyRLOlAA?si=M3qbnD0neAh6EweZ';

const downloadYouTubeVideo = async (videoUrl, downloadDirectory) => {
    const outputPath = path.join(downloadDirectory, 'video.mp4');
    
    // Use yt-dlp with lowest quality video
    const command = `yt-dlp -f "worst[ext=mp4]/worst" -o "${outputPath}" "${videoUrl}"`;
    
    try {
        console.log('Starting download...');
        const { stdout, stderr } = await execAsync(command);
        console.log('Video downloaded successfully!');
        if (stdout) console.log(stdout);
        if (stderr) console.log('Info:', stderr);
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
};

downloadYouTubeVideo(videoUrl, downloadDirectory)
    .then(() => console.log('Download completed.'))
    .catch(error => console.error('Download failed:', error));