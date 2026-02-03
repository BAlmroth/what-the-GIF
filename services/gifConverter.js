import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

const exportDirectory = path.resolve('./downloads/gifs');

// Create directory if it doesn't exist
if (!fs.existsSync(exportDirectory)) {
    fs.mkdirSync(exportDirectory, { recursive: true });
}

export const convertVideoToGif = async (videoPath, outputPath, options = {}) => {

    const {
        startTime = '00:00:00',
        duration = '5',
        scaleWidth = 480,
        fps = 10
    } = options;

    // ffmpeg command to convert video to GIF
    const command = `ffmpeg -ss ${startTime} -t ${duration} -i "${videoPath}" -vf "fps=${fps},scale=${scaleWidth}:-1:flags=lanczos" -loop 0 "${outputPath}"`;

    try {
        console.log('Starting GIF conversion...');
        const { stdout, stderr } = await execAsync(command);
        console.log('GIF created successfully!');
        return outputPath;
    }
    catch (error) {
        console.error('Error converting video to GIF:', error);
        throw error;
    }
}