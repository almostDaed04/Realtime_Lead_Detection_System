const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Check if the AI service is healthy.
 */
const checkHealth = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    throw new Error('AI service is not responding.');
  }
};

/**
 * Send an image to the detection endpoint.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {string} filename - Original filename.
 * @param {string} contentType - MIME type of the image.
 * @returns {{ leaf_count: number, boxes: number[][] }}
 */
const detectLeaves = async (imageBuffer, filename, contentType) => {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', imageBuffer, { filename, contentType });

  const response = await axios.post(`${AI_SERVICE_URL}/detect`, form, {
    headers: form.getHeaders(),
    timeout: 15000,
  });

  return response.data;
};

/**
 * Send a cropped leaf image to the classification endpoint.
 * @param {Buffer} croppedBuffer - The cropped leaf image buffer.
 * @returns {{ species: string, confidence: number }}
 */
const classifyLeaf = async (croppedBuffer) => {
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('file', croppedBuffer, {
    filename: 'cropped_leaf.jpg',
    contentType: 'image/jpeg',
  });

  const response = await axios.post(`${AI_SERVICE_URL}/classify`, form, {
    headers: form.getHeaders(),
    timeout: 15000,
  });

  return response.data;
};

module.exports = { checkHealth, detectLeaves, classifyLeaf };
