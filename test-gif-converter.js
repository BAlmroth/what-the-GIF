import { convertVideoToGif } from "./services/gifConverter.js";
import path from "path";

const videoPath = path.resolve('./downloads/ytdl-downloads/video.mp4');
const outputPath = path.resolve('./downloads/gifs/output.gif');

convertVideoToGif(videoPath, outputPath, {
    startTime: '00:00:05',
    duration: '10',
    scaleWidth: 480,
}).then((gifPath) => {
    console.log('GIF saved at:', gifPath);
}).catch((error) => {
    console.error('Failed to convert video to GIF:', error);
});