import { downloadYouTubeVideo } from "./services/youtubeDownloader.js";
import { convertVideoToGif } from "./services/gifConverter.js";

const videoUrl = 'https://youtu.be/FUKmyRLOlAA?si=M3qbnD0neAh6EweZ';

const video = await downloadYouTubeVideo(videoUrl);
console.log('video downloaded to:', video.filepath);

const gifUrl = await convertVideoToGif(video.filepath, null, {
        startTime: '00:00:00',
        duration: '5',
        scaleWidth: 480,
});

console.log('Gif uploaded to cloudinary!', gifUrl);