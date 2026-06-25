const data = require('../data/solidworks.json');

const KEYWORDS = {
  saludo: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'que tal', 'saludos'],
  instalacion: ['instalar', 'instalacion', 'instalación', 'instalo', 'descargar', 'descarga', 'setup', 'bajar'],
  requisitos: ['requisitos', 'requisito', 'especificaciones', 'ram', 'procesador', 'disco', 'espacio', 'tarjeta grafica', 'gpu', 'compatible', 'computadora', 'pc', 'equipo minimo'],
  version: ['version', 'versión', 'versiones', '2024', '2025', 'cual version', 'qué version', 'ultima', 'service pack'],
  error: ['error', 'falla', 'fallo', 'no funciona', 'no abre', 'problema', 'no inicia', 'pantalla azul', 'cuelga'],
  activacion: ['activar', 'activacion', 'activación', 'licencia', 'serial', 'numero de serie', 'clave'],
  soporte: ['soporte', 'ayuda humana', 'hablar con alguien', 'contactar', 'whatsapp', 'persona', 'agente', 'humano', 'técnico', 'tecnico'],
  actualizacion: ['actualizar', 'actualización', 'actualizacion', 'update', 'upgrade', 'migrar'],
  desinstalar: ['desinstalar', 'desinstalacion', 'eliminar solidworks', 'quitar solidworks', 'borrar solidworks', 'remover'],
  lento: ['lento', 'lenta', 'lentitud', 'tarda mucho', 'muy lento', 'rendimiento', 'pesado', 'lag'],
  crash: ['crash', 'crashea', 'se cierra', 'se cierra solo', 'se cuelga', 'se congela', 'se traba', 'pantalla azul', 'dejo de funcionar'],
  productos: ['standard', 'professional', 'premium', 'que incluye', 'diferencia', 'paquetes', 'planes', 'tipos de solidworks'],
  tipo_licencia: ['tipo de licencia', 'licencia de red', 'licencia flotante', 'standalone', 'solidnetwork', 'snl', 'online licensing'],
  simulation: ['simulation', 'simulacion', 'simulación', 'mesh', 'mallado', 'solver', 'analisis', 'fea', 'esfuerzos', 'elementos finitos'],
  pdm: ['pdm', 'vault', 'bóveda', 'base de datos', 'archivo servidor', 'archive server', 'gestion de datos'],
  electrical: ['electrical', 'electrico', 'eléctrico', 'esquematico', 'sql server'],
  visualize: ['visualize', 'renderizado', 'render', 'renderizar', 'foto realista'],
  draftsight: ['draftsight', 'dwg', 'autocad', 'dibujo 2d'],
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

const PRIORITY = {
  error: 10,
  crash: 10,
  lento: 10,
  desinstalar: 9,
  tipo_licencia: 8,
  activacion: 8,
  soporte: 7,
  productos: 6,
  requisitos: 5,
  version: 5,
  actualizacion: 5,
  instalacion: 3,
  saludo: 1,
};

function detectIntent(message) {
  const normalized = normalize(message);
  const matches = [];

  for (const [intent, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(normalize(keyword))) {
        matches.push(intent);
        break;
      }
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];

  matches.sort((a, b) => (PRIORITY[b] || 0) - (PRIORITY[a] || 0));
  return matches[0];
}

function detectErrorCode(message) {
  const normalized = normalize(message);
  for (const error of data.errores_comunes) {
    if (normalized.includes(normalize(error.codigo)) || normalized.includes(normalize(error.titulo))) {
      return error;
    }
  }
  return null;
}

function formatInstalacion() {
  const pasos = data.instalacion.pasos.map(p => {
    let texto = `**Paso ${p.numero}: ${p.titulo}**\n${p.descripcion}`;
    if (p.video) {
      texto += `\n🎬 Video: ${p.video}`;
    }
    return texto;
  });
  return `📦 **Guía de instalación de SolidWorks**\n\n${pasos.join('\n\n')}`;
}

function formatRequisitos() {
  const r = data.requisitos.solidworks_2025;
  const notas = data.requisitos.notas_generales.map(n => `⚠️ ${n}`).join('\n');
  return `💻 **Requisitos del sistema para SolidWorks 2025**\n\n` +
    `• **Sistema operativo:** ${r.so.join(', ')}\n` +
    `• **RAM:** ${r.ram}\n` +
    `• **Procesador:** ${r.procesador}\n` +
    `• **Núcleos:** ${r.nucleos}\n` +
    `• **Disco duro:** ${r.disco}\n` +
    `• **Tarjeta gráfica:** ${r.grafica.certificadas.join(', ')}\n` +
    `• **VRAM:** ${r.grafica.vram}\n` +
    `• **Resolución:** ${r.resolucion}\n` +
    `• **.NET Framework:** ${r.net_framework}\n` +
    `• **Internet:** ${r.internet}\n\n` +
    `${notas}`;
}

function formatError(error) {
  let text = `❌ **${error.titulo}**\n\n`;
  if (error.causas && error.causas.length > 0) {
    text += `**Posibles causas:**\n${error.causas.map(c => `• ${c}`).join('\n')}\n\n`;
  }
  text += `**Solución:**\n${error.solucion}`;
  if (error.enlace) {
    text += `\n\n📄 Más info: ${error.enlace}`;
  }
  return text;
}

function formatSoporte() {
  return {
    response: `No te preocupes, completa el siguiente formulario y un técnico de CADSO se pondrá en contacto contigo.`,
    showForm: true,
  };
}

function getResponse(message) {
  const errorMatch = detectErrorCode(message);
  if (errorMatch) {
    return { answered: true, response: formatError(errorMatch) };
  }

  const intent = detectIntent(message);

  switch (intent) {
    case 'saludo':
      return {
        answered: true,
        response: data.bienvenida.mensaje,
        opciones: data.bienvenida.opciones,
      };

    case 'instalacion':
      return { answered: true, response: formatInstalacion() };

    case 'requisitos':
      return { answered: true, response: formatRequisitos() };

    case 'version':
      return {
        answered: true,
        response: `📋 **Versiones disponibles:** ${data.versiones.disponibles.join(', ')}\n\n` +
          `✅ **Recomendada:** ${data.versiones.recomendada}\n\n` +
          `${data.versiones.nota}`,
      };

    case 'activacion':
      const errorLicencia = data.errores_comunes.find(e => e.codigo === 'licencia');
      if (errorLicencia) {
        return { answered: true, response: formatError(errorLicencia) };
      }
      return { answered: false };

    case 'actualizacion':
      return {
        answered: true,
        response: `🔄 **Para actualizar SolidWorks:**\n\n` +
          `1. Abre el **SolidWorks Installation Manager** desde el menú Inicio.\n` +
          `2. Selecciona **'Modificar la instalación individual'**.\n` +
          `3. Elige la nueva versión y sigue los pasos del asistente.\n\n` +
          `⚠️ Se recomienda hacer un respaldo de tus configuraciones antes de actualizar.\n\n` +
          `¿Necesitas la guía completa de instalación desde cero?`,
      };

    case 'error':
      return {
        answered: true,
        response: `Veo que tienes un problema. Para ayudarte mejor, ¿podrías decirme:\n\n` +
          `• ¿Qué código de error te aparece?\n` +
          `• ¿En qué paso de la instalación ocurre?\n` +
          `• ¿Qué versión de SolidWorks estás instalando?\n\n` +
          `Estos son los errores más comunes que puedo resolver:\n` +
          data.errores_comunes.map(e => `• **${e.codigo}** - ${e.titulo}`).join('\n'),
      };

    case 'soporte':
      return { answered: true, ...formatSoporte() };

    case 'desinstalar': {
      const err = data.errores_comunes.find(e => e.codigo === 'desinstalar');
      if (err) return { answered: true, response: formatError(err) };
      return { answered: false };
    }

    case 'lento': {
      const err = data.errores_comunes.find(e => e.codigo === 'lento');
      if (err) return { answered: true, response: formatError(err) };
      return { answered: false };
    }

    case 'crash': {
      const err = data.errores_comunes.find(e => e.codigo === 'crash');
      if (err) return { answered: true, response: formatError(err) };
      return { answered: false };
    }

    case 'productos': {
      const p = data.productos;
      return {
        answered: true,
        response: `📦 **Paquetes de SolidWorks**\n\n` +
          `**${p.solidworks_standard.nombre}:**\n${p.solidworks_standard.incluye.map(i => `• ${i}`).join('\n')}\n\n` +
          `**${p.solidworks_professional.nombre}:**\n${p.solidworks_professional.incluye.map(i => `• ${i}`).join('\n')}\n\n` +
          `**${p.solidworks_premium.nombre}:**\n${p.solidworks_premium.incluye.map(i => `• ${i}`).join('\n')}`,
      };
    }

    case 'tipo_licencia': {
      const lic = data.tipos_licencia;
      return {
        answered: true,
        response: `🔑 **Tipos de licencia de SolidWorks**\n\n` +
          `**${lic.standalone.nombre}:**\n${lic.standalone.descripcion}\n\n` +
          `**${lic.network.nombre}:**\n${lic.network.descripcion}\n\n` +
          `**${lic.online.nombre}:**\n${lic.online.descripcion}`,
      };
    }

    default:
      return { answered: false };
  }
}

function getWelcomeMessage() {
  return {
    response: data.bienvenida.mensaje,
    opciones: data.bienvenida.opciones,
  };
}

function getSystemContext() {
  return data.documentacion_contexto +
    '\n\nErrores conocidos: ' +
    data.errores_comunes.map(e => `${e.codigo}: ${e.titulo} - ${e.solucion}`).join('\n');
}

module.exports = { getResponse, getWelcomeMessage, getSystemContext };
