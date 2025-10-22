import cloudinary from '../config/cloudinary.js';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';
import dotenv from 'dotenv';
dotenv.config();

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const pageCount = pdfData.numpages;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'vending-print',
        format: 'pdf',
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to upload to Cloudinary' });
        }

        res.json({
          url: result.secure_url,
          publicId: result.public_id,
          pageCount,
          fileName: req.file.originalname,
        });
        
      }
    );

    const readableStream = Readable.from(req.file.buffer);
    readableStream.pipe(uploadStream);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};
