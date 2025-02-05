// Backend - Node.js with Express

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const archiver = require('archiver');

const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const UNLABELED_DIR = path.join(DATA_DIR, 'unlabeled');
const LABELED_DIR = path.join(DATA_DIR, 'labeled');

// Ensure labeled directories exist
const categories = ['unsure', 'no_giraffe', 'multiple_giraffes'];
if (!fs.existsSync(LABELED_DIR)) fs.mkdirSync(LABELED_DIR);
categories.forEach(cat => {
    const dir = path.join(LABELED_DIR, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Serve a random image
app.get('/api/image', (req, res) => {
    fs.readdir(UNLABELED_DIR, (err, files) => {
        if (err) return res.status(500).json({ error: 'Unable to read directory' });
        const randomFile = files[Math.floor(Math.random() * files.length)];
        res.sendFile(path.join(UNLABELED_DIR, randomFile));
    });
});

// Handle labeling submission
app.post('/api/label', (req, res) => {
    const { imageName, label } = req.body;
    const srcPath = path.join(UNLABELED_DIR, imageName);
    const destDir = path.join(LABELED_DIR, label);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

    const destPath = path.join(destDir, imageName);
    fs.rename(srcPath, destPath, (err) => {
        if (err) return res.status(500).json({ error: 'Error moving file, ${err.message}' });
        res.json({ success: true });
    });
});

// Admin download route
app.get('/api/download', (req, res) => {
    const archive = archiver('zip');
    res.attachment('labeled_data.zip');
    archive.pipe(res);
    archive.directory(LABELED_DIR, false);
    archive.finalize();
});

app.get('/', (req, res) => {
    res.send('Giraffe Labeling Backend is Running!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
