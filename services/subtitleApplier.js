import { exec } from 'child_process';
import fs from 'fs';
import path, { format } from 'path';
import util from 'util';
import { fileURLToPath } from 'url';

const execAsync = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDirectory = path.resolve(__dirname, '../temp');

// Apply subtitles to video using FFmpeg
export const applySubtitlesToVideo = async (videoPath, subtitlePath, options= {}) => {

    const {
        fontSize = 30,
        fontColor = 'white',
        outlineColor = 'black',
        outlineWidth = 3,
        position = 'bottom'
    } = options;

    const timestamp = Date.now();
    const outPath = path.join(tempDirectory, `video-subtitled-${timestamp}.mp4`);


    // FFmpeg command to burn subtitles into video

    // Escape paths for FFmpeg on Windows
    const escapedSubPath = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:');

    const subtitleFilter = `subtitles='${escapedSubPath}':force_style='FontSize=${fontSize},PrimaryColour=&H${colorToHex(fontColor)}&,OutlineColour=&H${colorToHex(outlineColor)}&,Outline=${outlineWidth},Alignment=${position === 'top' ? 6 : 2}'`;

    const command = `ffmpeg -i "${videoPath}" -vf "${subtitleFilter}" -c:a copy "${outPath}"`;

    try {
        console.log('Applying subtitles to video with command:', command);
        await execAsync(command);

        if (!fs.existsSync(outPath)) {
            throw new Error('Subtitled video file was not created.');
        }

        console.log('Subtitles applied successfully. Output path:', outPath);

        return {
            filepath: outPath,
            filename: path.basename(outPath)
        };
    } catch (error) {
        console.error('Error applying subtitles to video:', error);
        throw error;
    }
};

// Create custom subtitles
export const createCustomSubtitle = async (text, startTime = 0, duration = 5) => {
    const timestamp = Date.now();
    const filename = `custom-subtitle-${timestamp}.srt`;
    const filepath = path.join(tempDirectory, filename);

    const start = formatSRTTime(startTime);
    const end = formatSRTTime(startTime + duration);

    const srtContent = `1\n${start} --> ${end}\n${text}\n\n`;

    fs.writeFileSync(filepath, srtContent);

    console.log('Custom subtitle created at:', filepath);

    return filepath;
}

// Convert color names to hex values for FFmpeg
function colorToHex(color) {
    const colors = {
        white: '00FFFFFF',
        black: '00000000',
        red: '00FF0000',
        green: '0000FF00',
        blue: '000000FF',
        yellow: '00FFFF00',
        cyan: '0000FFFF',
        magenta: '00FF00FF'
    };

    return colors[color.toLowerCase()] || '00FFFFFF';
}

// Format time in SRT format (HH:MM:SS,mmm)
function formatSRTTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);

    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}