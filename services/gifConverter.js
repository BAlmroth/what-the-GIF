import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { downloadYouTubeVideo } from './youtubeDownloader.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import cloudinary from '../config/cloudinary.js';
import { cleanupTempFiles } from '../utils/cleanup.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');

export const convertVideoToGif = async (videoPath, _outputPath, options = {}) => {

    const {
        startTime = '00:00:00',
        duration = '5',
        scaleWidth = 480,
        fps = 10
    } = options;

    const timestamp = Date.now();
    const gifFileName = `gif-${timestamp}.gif`;
    const gifPath = path.join(tempDirectory, gifFileName);

    // const tempGifPath = path.join(os.tmpdir(), `gif-${Date.now()}.gif`);

    const command = `ffmpeg -ss ${startTime} -t ${duration} -i "${videoPath}" -vf "fps=${fps},scale=${scaleWidth}:-1:flags=lanczos" -loop 0 "${gifPath}"`;

    // Convert video to GIF
    try {
        console.log('Starting GIF conversion...');
        await execAsync(command);

        console.log('Uploading GIF to Cloudinary...');
        const result = await cloudinary.uploader.upload(gifPath, {
            resource_type: 'image',
            folder: 'gifs'
        });

        console.log('GIF uploaded:', result.secure_url);

        // Cleanup temporary files
        cleanupTempFiles(videoPath, gifPath);

        return result.secure_url;
    }
    catch (error) {
        console.error('Error converting video to GIF:', error);
        cleanupTempFiles(videoPath, gifPath);
        throw error;
    }
};