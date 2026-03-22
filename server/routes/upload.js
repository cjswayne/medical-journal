const express = require('express');
const multer = require('multer');
const authCheck = require('../middleware/authCheck');
const { uploadBuffer } = require('../utils/cloudinaryUpload');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Accept up to 10 files under field name "images"
router.post('/', authCheck, upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const urls = [];

    for (const file of files) {
      const result = await uploadBuffer(file.buffer);
      urls.push(result.secure_url);
    }

    res.json({ urls });
  } catch (err) {
    console.error('POST /api/upload:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
