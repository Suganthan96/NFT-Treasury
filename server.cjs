const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const fs = require('fs');
const FormData = require('form-data');
// Use dynamic import for fetch in CommonJS:
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for all origins (or restrict to your frontend origin)
app.use(cors()); // or: app.use(cors({ origin: 'https://localhost:5173' }));

// Pinata file upload endpoint
app.post('/api/pinata-upload', (req, res) => {
  const form = new formidable.IncomingForm({ maxFileSize: 10 * 1024 * 1024 });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(400).json({ error: err.message });
    }
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.error('No file provided');
      return res.status(400).json({ error: 'No file provided' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Pinata error:', data);
        return res.status(500).json({ error: data.error || 'Failed to upload to Pinata' });
      }

      fs.unlinkSync(file.filepath);
      res.status(200).json(data);
    } catch (e) {
      console.error('Fetch error:', e);
      res.status(500).json({ error: e.message });
    }
  });
});

// Pinata metadata upload endpoint
app.use(express.json());
app.post('/api/pinata-metadata', async (req, res) => {
  const metadata = req.body;
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${metadata.name}-metadata.json` },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Pinata metadata error:', data);
      return res.status(500).json({ error: data.error || 'Failed to upload metadata to Pinata' });
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('Metadata fetch error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));