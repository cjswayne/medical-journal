const cloudinary = require('../config/cloudinary');

// Streams buffer to Cloudinary; rejects on upload errors (caller should log if needed).
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'weed-diary', ...options },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { uploadBuffer };
