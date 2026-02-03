import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import cloudinary from '../config/cloudinary.js';

const execAsync = promisify(exec);

export const convertVideoToGif = async (videoPath, _outputPath, options = {}) => {

    const {
        startTime = '00:00:00',
        duration = '5',
        scaleWidth = 480,
        fps = 10
    } = options;

    const tempGifPath = path.join(os.tmpdir(), `gif-${Date.now()}.gif`);

    const command = `ffmpeg -ss ${startTime} -t ${duration} -i "${videoPath}" -vf "fps=${fps},scale=${scaleWidth}:-1:flags=lanczos" -loop 0 "${tempGifPath}"`;

    try {
        console.log('Starting GIF conversion...');
        await execAsync(command);

        console.log('Uploading GIF to Cloudinary...');
        const result = await cloudinary.uploader.upload(tempGifPath, {
            resource_type: 'image',
            folder: 'gifs'
        });

        fs.unlinkSync(tempGifPath);

        console.log('GIF uploaded:', result.secure_url);
        return result.secure_url;
    }
    catch (error) {
        console.error('Error converting video to GIF:', error);
        throw error;
    }
};