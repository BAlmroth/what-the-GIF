import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { downloadYouTubeVideo } from './youtubeDownloader.js';
import path from 'path';
import fs from 'fs';
import os from 'os';
import cloudinary from '../config/cloudinary.js';
import { cleanupTempFiles } from '../utils/cleanup.js';
import { applySubtitlesToVideo } from './subtitleApplier.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');

export const convertVideoToGif = async (videoPath, _outputPath, options = {}) => {

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
        // Step 1: If subtitles provided, burn them into video FIRST
        if (subtitlePath && fs.existsSync(subtitlePath)) {
            console.log('Burning subtitles into video...');
            const subtitledVideo = await applySubtitlesToVideo(videoPath, subtitlePath);
            subtitledVideoPath = subtitledVideo.filepath;
            processedVideoPath = subtitledVideoPath;  // ← Use subtitled video for GIF
            console.log('Subtitles applied to video');
        }

        // Step 2: Convert (subtitled) video to GIF
        const timestamp = Date.now();
        const gifFileName = `gif-${timestamp}.gif`;
        const gifPath = path.join(tempDirectory, gifFileName);

        const videoFilter = `fps=${fps},scale=${scaleWidth}:-1:flags=lanczos`;
        const command = `ffmpeg -ss ${startTime} -t ${duration} -i "${processedVideoPath}" -vf "${videoFilter}" -loop 0 "${gifPath}"`;

        console.log('Converting to GIF...');
        await execAsync(command);

        if (!fs.existsSync(gifPath)) {
            throw new Error('GIF file was not created');
        }

        const stats = fs.statSync(gifPath);
        console.log('GIF size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

        // Step 3: Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(gifPath, {
            resource_type: 'image',
            folder: 'gifs'
        });

        // Step 4: Cleanup
        const filesToClean = [videoPath, gifPath];
        if (subtitlePath) filesToClean.push(subtitlePath);
        if (subtitledVideoPath) filesToClean.push(subtitledVideoPath);  // ← Clean subtitled video too
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

        throw error;
    }
};