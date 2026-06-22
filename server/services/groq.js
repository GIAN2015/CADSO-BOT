const Groq = require('groq-sdk');
const config = require('../config');
const { getSystemContext } = require('./knowledge');

const groq = new Groq({ apiKey: config.groqApiKey });

const SYSTEM_PROMPT = `Eres el asistente técnico de CADSO, revendedor autorizado de SolidWorks en Perú. Tu trabajo es ayudar a los usuarios a instalar SolidWorks y resolver problemas de instalación.

Reglas:
- Responde SOLO sobre SolidWorks, su instalación, configuración y errores relacionados.
- Si te preguntan algo que no tiene que ver con SolidWorks, responde amablemente que solo puedes ayudar con temas de SolidWorks.
- Sé conciso y claro. Usa pasos numerados cuando expliques procedimientos.
- Si no puedes resolver el problema, sugiere al usuario que escriba "soporte" o "contactar" para que pueda llenar un formulario de asistencia técnica.
- Responde siempre en español.
- No inventes información. Si no estás seguro, dilo.

Contexto técnico:
${getSystemContext()}

Para solicitar ayuda de un técnico, el usuario puede escribir "soporte" o "contactar" y aparecerá un formulario de contacto.`;

async function chat(history) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ];

  const response = await groq.chat.completions.create({
    model: config.groqModel,
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}

async function analyzeImage(imageBase64, userMessage) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: userMessage || 'Analiza esta imagen relacionada con SolidWorks. Identifica si es un error, un paso de instalación, o un problema. Explica qué ves y cómo solucionarlo.',
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64,
          },
        },
      ],
    },
  ];

  const response = await groq.chat.completions.create({
    model: config.groqVisionModel,
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}

module.exports = { chat, analyzeImage };
