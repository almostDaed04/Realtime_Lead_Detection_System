const axios = require('axios');
const sharp = require('sharp');
const Prediction = require('../models/Prediction');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/predict
 * Core pipeline: upload → validate → detect → classify → thumbnail → store → respond.
 * Maps to F.2 through F.8.
 */
const predict = async (req, res, next) => {
  try {
    // Step 1: File already validated by Multer middleware (MIME, size) — F.3
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    // Step 3: Send to AI service /detect — F.4
    const FormData = (await import('form-data')).default;
    const detectForm = new FormData();
    detectForm.append('file', imageBuffer, {
      filename: req.file.originalname,
      contentType: imageMimeType,
    });

    let detectResponse;
    try {
      detectResponse = await axios.post(`${AI_SERVICE_URL}/detect`, detectForm, {
        headers: detectForm.getHeaders(),
        timeout: 15000, // 15s timeout
      });
    } catch (aiError) {
      console.error('AI detection service error:', aiError.message);
      return res.status(503).json({
        error: 'Leaf detection service is temporarily unavailable. Please try again.',
      });
    }

    const { leaf_count, boxes } = detectResponse.data;

    // Step 4: Reject if not exactly one leaf — F.5
    if (leaf_count === 0) {
      return res.status(422).json({
        error: 'No leaf detected in the image. Please upload a clear image of a single leaf.',
        leafCount: leaf_count,
      });
    }

    if (leaf_count > 1) {
      return res.status(422).json({
        error: `Multiple leaves detected (${leaf_count}). Please upload an image containing exactly one leaf.`,
        leafCount: leaf_count,
      });
    }

    // Step 5: Crop to the single detected bounding box
    const [x1, y1, x2, y2] = boxes[0];
    const cropWidth = Math.max(1, Math.round(x2 - x1));
    const cropHeight = Math.max(1, Math.round(y2 - y1));

    let croppedBuffer;
    try {
      croppedBuffer = await sharp(imageBuffer)
        .extract({
          left: Math.max(0, Math.round(x1)),
          top: Math.max(0, Math.round(y1)),
          width: cropWidth,
          height: cropHeight,
        })
        .toBuffer();
    } catch (cropError) {
      console.error('Image crop error:', cropError.message);
      return res.status(500).json({ error: 'Failed to process the detected leaf region.' });
    }

    // Step 6: Send cropped image to AI service /classify — F.6
    const classifyForm = new FormData();
    classifyForm.append('file', croppedBuffer, {
      filename: 'cropped_leaf.jpg',
      contentType: 'image/jpeg',
    });

    let classifyResponse;
    try {
      classifyResponse = await axios.post(`${AI_SERVICE_URL}/classify`, classifyForm, {
        headers: classifyForm.getHeaders(),
        timeout: 15000,
      });
    } catch (aiError) {
      console.error('AI classification service error:', aiError.message);
      return res.status(503).json({
        error: 'Species classification service is temporarily unavailable. Please try again.',
      });
    }

    const { species, confidence } = classifyResponse.data;

    // Step 7: Generate compressed thumbnail (150×150), discard full-res — F.8
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(150, 150, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Full-resolution imageBuffer is now eligible for GC — we don't store it.

    // Step 8: Write prediction to database
    const prediction = new Prediction({
      userId: req.user._id,
      species,
      confidenceScore: Math.round(confidence * 100) / 100, // Normalize to 0-100
      timestamp: new Date(),
      thumbnail: {
        data: thumbnailBuffer,
        contentType: 'image/jpeg',
      },
    });

    await prediction.save();

    // Step 9: Return result to frontend — F.7
    res.status(201).json({
      message: 'Prediction successful.',
      prediction: {
        id: prediction._id,
        species: prediction.species,
        confidence: prediction.confidenceScore,
        timestamp: prediction.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { predict };
