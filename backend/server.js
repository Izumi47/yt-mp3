const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/convert', async (req, res) => {
    const youtubeURL = req.body.url;
    
    if (!ytdl.validateURL(youtubeURL)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(youtubeURL);
        const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        const outputDir = path.resolve(__dirname, '../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }
        const outputPath = path.resolve(outputDir, `${videoTitle}.mp3`);

        ffmpeg(ytdl(youtubeURL, { quality: 'highestaudio' }))
            .audioBitrate(128)
            .save(outputPath)
            .on('end', () => {
                return res.json({ downloadUrl: `/download/${videoTitle}.mp3` });
            })
            .on('error', (err) => {
                return res.status(500).json({ error: 'Error during conversion' });
            });
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching video information' });
    }
});

app.get('/download/:filename', (req, res) => {
    const filePath = path.resolve(__dirname, '../output', req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
