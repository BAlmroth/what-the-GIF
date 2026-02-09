import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');

// Create directory if it doesn't exist
if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
}

export const downloadYouTubeVideo = async (videoUrl) => {
    const timestamp = Date.now();
    const outputFileName = `video-${timestamp}.mp4`;
    const outputPath = path.join(tempDirectory, outputFileName);
    
    // Use yt-dlp with lowest quality video and js runtime set to node
    const command = `yt-dlp --extractor-args "youtube:player_client=web,ios" -f "worst[ext=mp4]/worst" -o "${outputPath}" "${videoUrl}"`; 
    
    try {
        console.log('Starting download from:', videoUrl);
        console.log('Downloading to:', outputPath);

        const { stdout, stderr } = await execAsync(command, {
            timeout: 120000, // 2 minutes timeout
        });
        
        if (!fs.existsSync(outputPath)) {
            throw new Error('Video download failed, file not found.');
        }

        // Log file size
        const stats = fs.statSync(outputPath);
        console.log(`Downloaded file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
        console.log('Download completed.');

        return {
            filepath: outputPath,
            filename: outputFileName
        };

        
    } catch (error) {
        console.error('Error downloading video:', error);
        
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        
        throw new Error(`Failed to download video: ${error.message}`);
    } 
};

