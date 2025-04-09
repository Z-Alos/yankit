import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import os from "os";
import fs from "fs";
import isDev from "electron-is-dev";
import { fileURLToPath } from "url";
import { create } from 'yt-dlp-exec';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(os.homedir(), "Downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Resolution priority
const RES_ORDER = ["144", "240", "360", "480", "720", "1080", "1440", "2160"];
console.log("motherFucker", getYtDlpPath());
const ytdlp = create(getYtDlpPath());
app.post("/api/getinfo", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required." });

    try {
        console.log("🔍 Fetching video data...");
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            preferFreeFormats: true
        });

        console.log(info)
        const parsedInfo = typeof info === "string" ? JSON.parse(info) : info;

        const filteredFormats = parsedInfo.formats
            .filter((f) => f.vcodec && f.vcodec.includes("avc1") && f.format_note && f.filesize !== null && f.ext === "mp4")
            .map((f) => {
                const res = f.format_note || f.height?.toString() || "Unknown";
                return {
                    resolution: res.replace("p", ""),
                    sizeMB: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + " MB" : "Unknown",
                    href: f.url,
                    formatID: f.format_id
                };
            })
            .sort((a, b) => {
                const aIndex = RES_ORDER.indexOf(a.resolution);
                const bIndex = RES_ORDER.indexOf(b.resolution);
                return (bIndex === -1 ? Infinity : bIndex) - (aIndex === -1 ? Infinity : aIndex);
            });

        res.json({
            title: parsedInfo.title,
            formats: filteredFormats,
            formatTest: parsedInfo.formats,
        });
    } catch (error) {
        console.error("❌ Error fetching video info:", error);
        res.status(500).json({ error: "Failed to retrieve video info", details: error.message });
    }
});

app.post("/api/download", async (req, res) => {
    const { url, videoFormatId, videoTitle } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required." });

    const fileName = `${safeEncode(videoTitle)}.mp4`;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    try {
        console.log(`📥 Downloading: ${videoTitle} (${videoFormatId})`);

        const ytdlpOptions = {
            output: filePath,
            format: `${videoFormatId}+bestaudio[ext=m4a]`,
            mergeOutputFormat: "mp4",
            verbose: true,
        };

        if (process.platform === "win32") {
            if (isDev) {
                ytdlpOptions.ffmpegLocation = path.join(__dirname, "bin", "win", "ffmpeg.exe");
            }else{
            ytdlpOptions.ffmpegLocation =path.join(process.resourcesPath, "bin", "win", "ffmpeg.exe");
            }
        }

        await ytdlp(url, ytdlpOptions);

        console.log("✅ Download complete. Sending file...");

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
                res.status(500).send("Failed to send the file.");
            }
        });
    } catch (error) {
        console.error("❌ yt-dlp download error:", error);
        res.status(500).json({ error: "Download failed", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server locked and loaded at http://localhost:${PORT}`);
});

// Helper to encode safe filenames
function safeEncode(name) {
    return name
        .replace(/\//g, '⁄')
        .replace(/\\/g, '∖')
        .replace(/:/g, '꞉')
        .replace(/\*/g, '∗')
        .replace(/\?/g, '？')
        .replace(/"/g, '”')
        .replace(/</g, '‹')
        .replace(/>/g, '›')
        .replace(/\|/g, 'ǀ');
}

// Determine yt-dlp binary path
function getYtDlpPath() {
    let platformFolder = '';
    if (process.platform === 'win32') platformFolder = 'win';
    else if (process.platform === 'linux') platformFolder = 'linux';
    else if (process.platform === 'darwin') platformFolder = 'mac';
    else throw new Error("Unsupported OS");

    const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

    const binPath = isDev
        ? path.join(__dirname, 'bin', platformFolder, binaryName)
        : path.join(process.resourcesPath, 'bin', platformFolder, binaryName);

    console.log("🔧 Mode:", isDev ? "🛠 DEV" : "📦 PROD");
    console.log("🧭 yt-dlp path:", binPath);

    if (!fs.existsSync(binPath)) {
        console.error("❌ yt-dlp binary not found at:", binPath);
        throw new Error(`yt-dlp binary not found at: ${binPath}`);
    }

    return binPath;
}

