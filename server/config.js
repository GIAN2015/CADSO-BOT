require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: 'llama-3.3-70b-versatile',
  groqVisionModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
  whatsappNumber: '51967152992',
};
