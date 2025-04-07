import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import ytdlp from "yt-dlp-exec";
import path from "path";
import os from 'os';
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_DIR = path.join(os.homedir(), 'Downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}
app.post("/api/getinfo", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required." });

    try {
        console.log("fetching data...")
        const info = await ytdlp(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
        },{
            execPath: getYtDlpPath(),
        });

        // yt-dlp-exec returns a JSON string unless passed `execOptions.shell: true`
        const parsedInfo = typeof info === "string" ? JSON.parse(info) : info;
        const RES_ORDER = ["144", "240", "360", "480", "720", "1080", "1440", "2160"]; // Super classics

        const filteredFormats = parsedInfo.formats 
            .filter((f) => f.vcodec.includes("avc1") && f.ext === "mp4") // Only video formats, preferably MP4
            .map((f) => ({
                resolution: f.format_note? `${f.format_note}` : "Unknown",
                sizeMB: f.filesize ? (f.filesize / 1024 / 1024).toFixed(2) + " MB" : "Unknown",
                href: f.url,
                formatID: f.format_id
            }))
            .sort((a, b) => {
                console.log(a, b);
                const aIndex = RES_ORDER.indexOf(a.resolution.replace("p", ""));
                const bIndex = RES_ORDER.indexOf(b.resolution.replace("p", ""));
                return aIndex - bIndex;
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

    // const fileName = `video_${Date.now()}.mp4`;
    const fileName = `${safeEncode(videoTitle)}.mp4`;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    try {
        console.log(`📥 Downloading from: ${url}`);

        await ytdlp(url, {
            output: filePath,
            format: `${videoFormatId}+bestaudio[ext=m4a]`,
            mergeOutputFormat: "mp4",
            verbose: true,
        },{
            execPath: getYtDlpPath(),
        });

        console.log("✅ Download finished. Sending file...");

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
                res.status(500).send("Failed to send the file.");
            }
        });
    } catch (error) {
        console.error("❌ yt-dlp error:", error);
        res.status(500).json({ error: "Download failed", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server locked and loaded at http://localhost:${PORT}`);
});

function safeEncode(name) {
    return name
        .replace(/\//g, '⁄')   // U+2044 FRACTION SLASH
        .replace(/\\/g, '∖')   // U+2216 SET MINUS
        .replace(/:/g, '꞉')    // U+A789 MODIFIER LETTER COLON
        .replace(/\*/g, '∗')   // U+2217 ASTERISK OPERATOR
        .replace(/\?/g, '？')   // Full-width question mark
        .replace(/"/g, '”')    // U+201D
        .replace(/</g, '‹')    // U+2039
        .replace(/>/g, '›')    // U+203A
        .replace(/\|/g, 'ǀ');  // U+01C0 LATIN LETTER DENTAL CLICK
}

const getYtDlpPath = () => {
    let platformFolder = '';
    if (process.platform === 'win32') platformFolder = 'win';
    else if (process.platform === 'linux') platformFolder = 'linux';
    else if (process.platform === 'darwin') platformFolder = 'mac';
    else throw new Error("Unsupported OS");

    const isProd = process.pkg || process.resourcesPath;
    const basePath = isProd ? process.resourcesPath : __dirname;

    const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const binPath = path.join(basePath, 'bin', platformFolder, binaryName);

    return binPath;
};

