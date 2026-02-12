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

    const strategies = [];

    if (process.env.NORDVPN_USERNAME && process.env.NORDVPN_PASSWORD) {
        strategies.push(
            {method: 'vpn', server: getNextServer() },
            {method: 'vpn', server: getNextServer() }
        )
    }

    strategies.push({ method: 'direct' });

    let lastError = null;

    for (const strategy of strategies) {
        try {
            console.log(`🔄 Attempt ${strategies.indexOf(strategy) + 1}/${strategies.length}:`, 
                strategy.method === 'vpn' ? `VPN (${strategy.server})` : 'Direct download');

            const result = await attemptDownload(videoUrl, outputPath, strategy);

            console.log('Download successful using strategy:', strategy.method);
            return result;
        } catch (error) {
            lastError = error;
            console.error(`Error with strategy ${strategy.method}:`, error);

            // Clean up failed download file if it exists
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }

            continue;
        }
    }

    // All strategies failed
    throw new Error(`All download strategies failed. Last error: ${lastError.message}`);
};

// Get next server in rotation
const getNextServer = () => {
    const server = NORDVPN_SERVERS[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % NORDVPN_SERVERS.length;
    return server;
}

// Attemp download with with specified strategy
async function attemptDownload(videoUrl, outputPath, strategy) {
    let proxyFlag = '';
    
    if (strategy.method === 'vpn') {
        const username = process.env.NORDVPN_USERNAME;
        const password = process.env.NORDVPN_PASSWORD;
        const server = strategy.server;
        
        proxyFlag = `--proxy "socks5://${username}:${password}@${server}"`;
    }

    // Add more yt-dlp options for reliability
    const command = `yt-dlp \
        ${proxyFlag} \
        --no-check-certificates \
        --socket-timeout 10 \
        --retries 2 \
        -f "worst[ext=mp4]/worst" \
        -o "${outputPath}" \
        "${videoUrl}"`;
    
    const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,  // Reduce timeout to 30 seconds per attempt
    });

    if (!fs.existsSync(outputPath)) {
        throw new Error('Video download failed, file not found.');
    }

    const stats = fs.statSync(outputPath);
    console.log(`Downloaded file size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);

    return {
        filepath: outputPath,
        filename: path.basename(outputPath)
    };
}