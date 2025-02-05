

const express = require('express');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Directories
const ORIGINAL_IMAGES_DIR = path.join(__dirname, 'data', 'unlabeled'); // Read-only
const UNLABELED_DIR = path.join('/tmp', 'unlabeled');                 // Writable
const LABELED_DIR = path.join('/tmp', 'labeled');                     // Writable

// Ensure writable directories exist
[UNLABELED_DIR, LABELED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.chmodSync(dir, 0o755);  // Read/write/execute permissions
  }
});

// Copy original images to /tmp/unlabeled on server startup
fs.readdir(ORIGINAL_IMAGES_DIR, (err, files) => {
  if (err) {
    console.error('Failed to read original images:', err);
    return;
  }
  files.forEach(file => {
    const src = path.join(ORIGINAL_IMAGES_DIR, file);
    const dest = path.join(UNLABELED_DIR, file);

    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      fs.chmodSync(dest, 0o644); // Ensure read/write permissions
    }
  });
});

// API to get a random unlabeled image
app.get('/api/image', (req, res) => {
    fs.readdir(UNLABELED_DIR, (err, files) => {
      if (err || files.length === 0) {
        return res.status(404).json({ error: 'No unlabeled images found.' });
      }
  
      const randomFile = files[Math.floor(Math.random() * files.length)];
  
      // Send the filename in a custom header
      res.setHeader('X-Image-Name', randomFile);
      res.setHeader('Content-Disposition', `attachment; filename="${randomFile}"`);
  
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
    try {
      fs.mkdirSync(labelDir, { recursive: true });
      fs.chmodSync(labelDir, 0o755); // Set write permissions
    } catch (err) {
      console.error(`Error creating label directory: ${err.message}`);
      return res.status(500).json({ error: 'Failed to create label directory.' });
    }
  }

  const newPath = path.join(labelDir, imageName);

  // Check if the file exists before moving
  if (!fs.existsSync(oldPath)) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  // Move the file with error handling
  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error(`Error moving file: ${err.message}`);
      return res.status(500).json({ error: `Failed to move the file: ${err.message}` });
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
