import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import { cleanupTempFiles } from '../utils/cleanup.js';
import { applySubtitlesToVideo } from './subtitleApplier.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');

export const convertVideoToGif = async (videoPath, options = {}) => {

    const {
        startTime = '00:00:00',
        duration = '5',
        scaleWidth = 480,
        fps = 10,
        subtitlePath = null
    } = options;

    let processedVideoPath = videoPath;
    let subtitledVideoPath = null;

    try {
        // Apply subtitles if provided
        if (subtitlePath && fs.existsSync(subtitlePath)) {
            console.log('Burning subtitles into video...');
            const subtitledVideo = await applySubtitlesToVideo(videoPath, subtitlePath);
            subtitledVideoPath = subtitledVideo.filepath;
            processedVideoPath = subtitledVideoPath;
            console.log('Subtitles burned successfully:', subtitledVideoPath);
        }

        // Convert to GIF
        const timestamp = Date.now();
        const gifFileName = `gif-${timestamp}.gif`;
        const gifPath = path.join(tempDirectory, gifFileName);

        console.log('Converting to GIF...');
        
        const command = `ffmpeg -ss ${startTime} -t ${duration} -i "${processedVideoPath}" -vf "fps=${fps},scale=${scaleWidth}:-1:flags=lanczos" -loop 0 "${gifPath}"`;
        
        await execAsync(command);
        
        if (!fs.existsSync(gifPath)) {
            console.error('GIF file was not created at:', gifPath);
            throw new Error('Failed to create GIF file.');
        }
        
        const stats = fs.statSync(gifPath);
        console.log('GIF size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

        // Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(gifPath, {
            resource_type: 'image',
            folder: 'gifs'
        });

        // Cleanup
        const filesToClean = [videoPath, gifPath];
        if (subtitlePath) filesToClean.push(subtitlePath);
        if (subtitledVideoPath) filesToClean.push(subtitledVideoPath);
        cleanupTempFiles(...filesToClean);

        console.log('GIF created:', result.secure_url);

        return {
            url: result.secure_url,
            cloudinaryId: result.public_id,
            width: result.width,
            height: result.height,
            fileSize: result.bytes,
            filename: gifFileName
        };

    } catch (error) {
        console.error('Error converting to GIF:', error);

        // Cleanup on error
        const filesToClean = [videoPath];
        if (subtitlePath) filesToClean.push(subtitlePath);
        if (subtitledVideoPath) filesToClean.push(subtitledVideoPath);
        cleanupTempFiles(...filesToClean);

        //user message
        throw new Error('Failed to convert video to GIF. Please try again.');
    }
};