const express = require('express');
const router = express.Router();
const knowledge = require('../services/knowledge');
const groq = require('../services/groq');
const { sendSupportEmail } = require('../services/mailer');

router.get('/welcome', (req, res) => {
  const welcome = knowledge.getWelcomeMessage();
  res.json(welcome);
});

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    const knowledgeResult = knowledge.getResponse(message);

    if (knowledgeResult.answered) {
      return res.json({
        response: knowledgeResult.response,
        source: 'knowledge',
        opciones: knowledgeResult.opciones || null,
        showForm: knowledgeResult.showForm || false,
      });
    }

    const chatHistory = (history || []).slice(-10);
    chatHistory.push({ role: 'user', content: message });

    const aiResponse = await groq.chat(chatHistory);

    return res.json({
      response: aiResponse,
      source: 'ai',
    });
  } catch (err) {
    console.error('Error en /api/chat:', err.message);
    return res.status(500).json({
      error: 'Hubo un error procesando tu mensaje. Intenta de nuevo.',
    });
  }
});

router.post('/image', async (req, res) => {
  try {
    const { image, message } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'La imagen es requerida' });
    }

    const maxSize = 4 * 1024 * 1024;
    const base64Data = image.split(',')[1] || image;
    if (base64Data.length > maxSize) {
      return res.status(413).json({ error: 'La imagen es muy grande. Máximo 4MB.' });
    }

    const aiResponse = await groq.analyzeImage(image, message);

    return res.json({
      response: aiResponse,
      source: 'vision',
    });
  } catch (err) {
    console.error('Error en /api/image:', err.message);
    return res.status(500).json({
      error: 'No pude analizar la imagen. Intenta de nuevo o describe el error con texto.',
    });
  }
});

router.post('/support', async (req, res) => {
  try {
    const { nombre, email, telefono, problema, imagen } = req.body;

    if (!nombre || !email || !problema) {
      return res.status(400).json({ error: 'Nombre, email y descripción del problema son requeridos.' });
    }

    await sendSupportEmail({ nombre, email, telefono, problema, imagen });
    console.log(`Solicitud de soporte enviada por email - ${nombre} (${email})`);

    return res.json({ success: true, message: 'Tu solicitud fue enviada. Un técnico de CADSO se contactará contigo pronto.' });
  } catch (err) {
    console.error('Error en /api/support:', err.message);
    return res.status(500).json({ error: 'No se pudo enviar la solicitud. Intenta de nuevo.' });
  }
});

module.exports = router;
