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
  que_es: ['que es solidworks', 'qué es solidworks', 'para que sirve', 'para qué sirve', 'que hace solidworks', 'definicion', 'definición'],
  formatos: ['formato', 'extension', 'extensión', 'sldprt', 'sldasm', 'slddrw', 'step', 'iges', 'stl', 'importar', 'exportar', 'abrir archivo'],
  composer: ['composer', 'documentacion tecnica', 'instrucciones de ensamblaje', 'manual tecnico'],
  cam: ['cam', 'cnc', 'fresado', 'mecanizado', 'manufactura', 'toolpath'],
  plastics: ['plastics', 'inyeccion', 'inyección', 'molde', 'plastico', 'plástico'],
  edrawings: ['edrawings', 'visor', 'visualizar sin solidworks', 'ver archivo'],
  experiencia3d: ['3dexperience', '3d experience', 'nube', 'cloud', 'plataforma', 'colaboracion en linea'],
  flow: ['flow simulation', 'fluidos', 'cfd', 'flujo', 'aerodinamica', 'aerodinámica', 'ventilacion', 'ventilación'],
  hardware: ['hardware certificado', 'equipo certificado', 'tarjeta certificada', 'compatible solidworks', 'laptop para solidworks', 'workstation', 'precision', 'zbook', 'thinkstation', 'equipo recomendado', 'que laptop', 'que computadora', 'que pc comprar'],
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
  hardware: 10,
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
  const niveles = data.requisitos.niveles;
  const perfiles = data.requisitos.perfiles;
  const notas = data.requisitos.notas_generales.map(n => `⚠️ ${n}`).join('\n');

  const filas = niveles.map(n =>
    `<tr>` +
    `<td><strong>${n.nivel}</strong></td>` +
    `<td>${n.so}</td>` +
    `<td>${n.ram}</td>` +
    `<td>${n.cpu_base}–${n.cpu_turbo}</td>` +
    `<td>${n.nucleos}</td>` +
    `<td>${n.disco}</td>` +
    `<td>${n.gpu_modelo} (${n.vram})</td>` +
    `<td>${n.piezas_referencia}</td>` +
    `</tr>`
  ).join('');

  const tabla = `<div class="cadso-table-wrap"><table class="cadso-table">` +
    `<thead><tr><th>Nivel</th><th>S.O.</th><th>RAM</th><th>CPU</th><th>Núcleos</th><th>Disco</th><th>GPU</th><th>Piezas</th></tr></thead>` +
    `<tbody>${filas}</tbody></table></div>`;

  return `💻 **Requisitos del sistema para SolidWorks**\n\n` +
    tabla + `\n\n` +
    `👤 **¿Qué perfil eres?**\n\n` +
    `**${perfiles.disenador_cad.titulo}** — Prioridad: ${perfiles.disenador_cad.prioridad}\n${perfiles.disenador_cad.descripcion}\n\n` +
    `**${perfiles.analista_fea_cfd.titulo}** — Prioridad: ${perfiles.analista_fea_cfd.prioridad}\n${perfiles.analista_fea_cfd.descripcion}\n\n` +
    `${data.requisitos.nota_seleccion}\n\n` +
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

    case 'que_es': {
      const q = data.que_es_solidworks;
      return {
        answered: true,
        response: `📐 **¿Qué es SolidWorks?**\n\n${q.definicion}\n\n` +
          `**¿Para qué sirve?**\n${q.para_que_sirve.map(u => `• ${u}`).join('\n')}\n\n` +
          `**Industrias:** ${q.industrias.join(', ')}`,
      };
    }

    case 'formatos': {
      const f = data.que_es_solidworks.formatos_archivo;
      return {
        answered: true,
        response: `📁 **Formatos de archivo de SolidWorks**\n\n` +
          `**Archivos nativos:**\n${Object.entries(f.nativos).map(([ext, desc]) => `• **${ext}** — ${desc}`).join('\n')}\n\n` +
          `**Importación:** ${f.importacion.join(', ')}\n\n` +
          `**Exportación:** ${f.exportacion.join(', ')}`,
      };
    }

    case 'simulation': {
      const s = data.productos_detallados.solidworks_simulation;
      return {
        answered: true,
        response: `🔬 **${s.nombre}**\n\n${s.que_es}\n\n` +
          `**Capacidades:**\n${s.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${s.cuando_usar}`,
      };
    }

    case 'pdm': {
      const p = data.productos_detallados.solidworks_pdm;
      return {
        answered: true,
        response: `🗄️ **${p.nombre}**\n\n${p.que_es}\n\n` +
          `**Capacidades:**\n${p.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**Versiones:**\n• **PDM Standard:** ${p.versiones_pdm['PDM Standard']}\n• **PDM Professional:** ${p.versiones_pdm['PDM Professional']}`,
      };
    }

    case 'electrical': {
      const e = data.productos_detallados.solidworks_electrical;
      return {
        answered: true,
        response: `⚡ **${e.nombre}**\n\n${e.que_es}\n\n` +
          `**Capacidades:**\n${e.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${e.cuando_usar}`,
      };
    }

    case 'visualize': {
      const v = data.productos_detallados.solidworks_visualize;
      return {
        answered: true,
        response: `🎨 **${v.nombre}**\n\n${v.que_es}\n\n` +
          `**Capacidades:**\n${v.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${v.cuando_usar}`,
      };
    }

    case 'composer': {
      const c = data.productos_detallados.solidworks_composer;
      return {
        answered: true,
        response: `📝 **${c.nombre}**\n\n${c.que_es}\n\n` +
          `**Capacidades:**\n${c.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${c.cuando_usar}`,
      };
    }

    case 'cam': {
      const c = data.productos_detallados.solidworks_cam;
      return {
        answered: true,
        response: `🏭 **${c.nombre}**\n\n${c.que_es}\n\n` +
          `**Capacidades:**\n${c.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${c.cuando_usar}`,
      };
    }

    case 'plastics': {
      const p = data.productos_detallados.solidworks_plastics;
      return {
        answered: true,
        response: `🧪 **${p.nombre}**\n\n${p.que_es}\n\n` +
          `**Capacidades:**\n${p.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${p.cuando_usar}`,
      };
    }

    case 'draftsight': {
      const d = data.productos_detallados.draftsight;
      return {
        answered: true,
        response: `📏 **${d.nombre}**\n\n${d.que_es}\n\n` +
          `**Capacidades:**\n${d.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${d.cuando_usar}`,
      };
    }

    case 'edrawings': {
      const e = data.productos_detallados.edrawings;
      return {
        answered: true,
        response: `👁️ **${e.nombre}**\n\n${e.que_es}\n\n` +
          `**Capacidades:**\n${e.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${e.cuando_usar}`,
      };
    }

    case 'experiencia3d': {
      const x = data.productos_detallados['3dexperience'];
      return {
        answered: true,
        response: `☁️ **${x.nombre}**\n\n${x.que_es}\n\n` +
          `**Capacidades:**\n${x.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**Diferencia vs Desktop:** ${x.diferencia_vs_desktop}`,
      };
    }

    case 'hardware': {
      const hw = data.requisitos.hardware_certificado;
      const filas = hw.equipos.map(e =>
        `<tr><td>${e.marca}</td><td>${e.modelo}</td><td>${e.so}</td><td>${e.gpu}</td><td>${e.sw_version}</td><td>${e.driver}</td></tr>`
      ).join('');
      const tabla = `<div class="cadso-table-wrap"><table class="cadso-table">` +
        `<thead><tr><th>Marca</th><th>Modelo</th><th>S.O.</th><th>GPU</th><th>SW Version</th><th>Driver</th></tr></thead>` +
        `<tbody>${filas}</tbody></table></div>`;
      return {
        answered: true,
        response: `🖥️ **Hardware certificado para SolidWorks**\n\n` +
          tabla + `\n\n` +
          `${hw.nota}`,
      };
    }

    case 'flow': {
      const f = data.productos_detallados.solidworks_flow_simulation;
      return {
        answered: true,
        response: `💨 **${f.nombre}**\n\n${f.que_es}\n\n` +
          `**Capacidades:**\n${f.capacidades.map(c => `• ${c}`).join('\n')}\n\n` +
          `**¿Cuándo usar?** ${f.cuando_usar}`,
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
