import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');

// Create directory if it doesn't exist
if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
}

const videoUrl = 'https://youtu.be/FUKmyRLOlAA?si=M3qbnD0neAh6EweZ';

export const downloadYouTubeVideo = async (videoUrl) => {
    const timestamp = Date.now();
    const outputFileName = `video-${timestamp}.mp4`;
    const outputPath = path.join(tempDirectory, outputFileName);
    
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

    return {
        filepath: outputPath,
        filename: outputFileName
    };
};


downloadYouTubeVideo(videoUrl, tempDirectory)
    .then(() => console.log('Download completed.'))
    .catch(error => console.error('Download failed:', error));

    // if (fs.existsSync('/temp-donwloads/video.mp4')) {
    //     console.log(os.tmpdir('/temp-donwloads/video.mp4'))
    // }



