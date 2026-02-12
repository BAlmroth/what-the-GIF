import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDirectory = path.resolve(__dirname, '../temp');
const cookiesPath = path.resolve(__dirname, '../config/youtube_cookies.txt');

// Create directory if it doesn't exist
if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
}

const NORDVPN_SERVERS = [
    'se.socks.nordhold.net:1080',
    'us.socks.nordhold.net:1080',
    'de.socks.nordhold.net:1080',
    'nl.socks.nordhold.net:1080',
    'fr.socks.nordhold.net:1080'
];

let currentServerIndex = 0;

export const downloadYouTubeVideo = async (videoUrl) => {
    const timestamp = Date.now();
    const outputFileName = `video-${timestamp}.mp4`;
    const outputPath = path.join(tempDirectory, outputFileName);

    // Check if cookies.txt exists for yt-dlp
    const hasCookies = fs.existsSync(cookiesPath);
    if (hasCookies) {
        console.log('Using cookies.txt for yt-dlp');
    } else {
        console.log("No cookies.txt found, proceeding without cookies");
    }

    const strategies = [];

    if (process.env.NORDVPN_USERNAME && process.env.NORDVPN_PASSWORD) {
        // Try 2 different VPN servers with cookies
        strategies.push(
            { method: 'vpn', server: getNextServer(), useCookies: hasCookies },
            { method: 'vpn', server: getNextServer(), useCookies: hasCookies }
        );
    }

    // Try direct with cookies
    if (hasCookies) {
        strategies.push({ method: 'direct', useCookies: true });
    }

    // Last resort: direct without cookies
    strategies.push({ method: 'direct', useCookies: false });

    let lastError = null;

    for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        try {
            const methodDesc = strategy.method === 'vpn' 
                ? `VPN (${strategy.server})` 
                : 'Direct';
            const cookieDesc = strategy.useCookies ? '+ Cookies' : '';
            
            console.log(`Attempt ${i + 1}/${strategies.length}: ${methodDesc} ${cookieDesc}`);
            
            const result = await attemptDownload(videoUrl, outputPath, strategy);
            
            console.log(`Download successful with: ${methodDesc} ${cookieDesc}`);
            return result;
            
        } catch (error) {
            lastError = error;
            console.log(`Failed:`, error.message.split('\n')[0]);
            
            // Clean up failed download
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            
            // Continue to next strategy
            continue;
        }
    }
    
    console.error('YouTube download failed after all attempts:', lastError);
    throw new Error('Could not download video. Please check the URL and try again.');
};

// Get next server in rotation
function getNextServer() {
    const server = NORDVPN_SERVERS[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % NORDVPN_SERVERS.length;
    return server;
}

// Attempt download with given strategy
async function attemptDownload(videoUrl, outputPath, strategy) {
    let proxyFlag = '';
    let cookiesFlag = '';
    
    if (strategy.method === 'vpn') {
        const username = process.env.NORDVPN_USERNAME;
        const password = process.env.NORDVPN_PASSWORD;
        const server = strategy.server;
        
        proxyFlag = `--proxy "socks5://${username}:${password}@${server}"`;
    }
    
    if (strategy.useCookies && fs.existsSync(cookiesPath)) {
        cookiesFlag = `--cookies "${cookiesPath}"`;
    }
    
    // Build command with cookies
    const command = `yt-dlp \
        ${proxyFlag} \
        ${cookiesFlag} \
        --socket-timeout 15 \
        --retries 3 \
        -f "worst[ext=mp4]/worst" \
        -o "${outputPath}" \
        "${videoUrl}"`;
    
    const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,  // 30 seconds per attempt
    });
    
    if (!fs.existsSync(outputPath)) {
        throw new Error('Video file not created');
    }
    
    const stats = fs.statSync(outputPath);
    console.log(`Downloaded: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    
    return {
        filepath: outputPath,
        filename: path.basename(outputPath)
    };
}