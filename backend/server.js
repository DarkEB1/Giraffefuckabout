const express = require('express');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver'); // For zipping files

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Persistent directories
const UNLABELED_DIR = path.join(__dirname, 'data', 'unlabeled');
const LABELED_DIR = path.join(__dirname, 'data', 'labeled');

// Ensure directories exist
[UNLABELED_DIR, LABELED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// API to get a random unlabeled image
app.get('/api/image', (req, res) => {
  fs.readdir(UNLABELED_DIR, (err, files) => {
    if (err || files.length === 0) {
      return res.status(404).json({ error: 'No unlabeled images found.' });
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    res.setHeader('Content-Disposition', `attachment; filename=${randomFile}`);
    res.sendFile(path.join(UNLABELED_DIR, randomFile));
  });
});

// API to handle labeling
app.post('/api/label', (req, res) => {
  const { imageName, label } = req.body;

  if (!imageName || !label) {
    return res.status(400).json({ error: 'Missing image name or label.' });
  }

  const oldPath = path.join(UNLABELED_DIR, imageName);
  const labelDir = path.join(LABELED_DIR, label);

  // Ensure label directory exists
  if (!fs.existsSync(labelDir)) {
    fs.mkdirSync(labelDir, { recursive: true });
  }

  const newPath = path.join(labelDir, imageName);

  // Move the file
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error(`Error moving file: ${err.message}`);
      return res.status(500).json({ error: 'Failed to move the file.' });
    }
    res.sendStatus(200);
  });
});

// API to download all labeled data as a ZIP
app.get('/api/download', (req, res) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  res.attachment('labeled_data.zip');

  archive.on('error', (err) => {
    console.error(`Error creating ZIP: ${err.message}`);
    res.status(500).send({ error: 'Failed to create ZIP file.' });
  });

  archive.pipe(res);
  archive.directory(LABELED_DIR, false);
  archive.finalize();
});

// Health check route
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
