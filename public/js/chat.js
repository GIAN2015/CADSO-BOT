(function () {
  const API_URL = window.CADSO_API_URL || '';
  let isOpen = false;
  let isExpanded = false;
  let history = [];

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function randomDelay() {
    return 800 + Math.random() * 1200;
  }

  function createWidget() {
    const btn = document.createElement('button');
    btn.className = 'cadso-chat-btn';
    btn.setAttribute('aria-label', 'Abrir chat de soporte');
    btn.innerHTML = `<img src="${API_URL}/img/botcad-naranja.png" alt="BotCAD" />`;
    btn.onclick = toggleChat;

    const win = document.createElement('div');
    win.className = 'cadso-chat-window';
    win.innerHTML = `
      <div class="cadso-chat-header">
        <div class="cadso-chat-header-avatar"><img src="${API_URL}/img/botcad-azul.png" alt="BotCAD" /></div>
        <div class="cadso-chat-header-info">
          <h3>BotCAD</h3>
          <p>Asistente de instalación SolidWorks</p>
        </div>
        <div class="cadso-chat-header-actions">
          <button class="cadso-expand-btn" aria-label="Expandir chat">
            <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          </button>
          <button class="cadso-close-btn" aria-label="Cerrar chat">
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      </div>
      <div class="cadso-chat-messages">
        <div class="cadso-chat-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="cadso-chat-input">
        <label class="cadso-attach-btn" aria-label="Adjuntar imagen">
          <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
          <input type="file" accept="image/*" style="display:none" />
        </label>
        <input type="text" placeholder="Escribe tu pregunta..." />
        <button aria-label="Enviar"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
      </div>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(win);

    const input = $('.cadso-chat-input input[type="text"]', win);
    const sendBtn = $('.cadso-chat-input button', win);
    const expandBtn = $('.cadso-expand-btn', win);
    const closeBtn = $('.cadso-close-btn', win);
    const fileInput = $('.cadso-attach-btn input[type="file"]', win);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    sendBtn.addEventListener('click', sendMessage);
    expandBtn.addEventListener('click', toggleExpand);
    closeBtn.addEventListener('click', toggleChat);
    fileInput.addEventListener('change', handleImage);

    input.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const fakeEvent = { target: { files: [file], value: '' } };
            handleImage(fakeEvent);
          }
          return;
        }
      }
    });
  }

  function toggleChat() {
    const win = $('.cadso-chat-window');
    const btn = $('.cadso-chat-btn');
    isOpen = !isOpen;

    if (isOpen) {
      win.classList.add('open');
      btn.classList.add('active');
      if (history.length === 0) loadWelcome();
      setTimeout(() => $('.cadso-chat-input input[type="text"]').focus(), 300);
    } else {
      win.classList.remove('open');
      btn.classList.remove('active');
      if (isExpanded) toggleExpand();
    }
  }

  function toggleExpand() {
    const win = $('.cadso-chat-window');
    const expandBtn = $('.cadso-expand-btn');
    isExpanded = !isExpanded;
    win.classList.toggle('expanded', isExpanded);

    expandBtn.innerHTML = isExpanded
      ? '<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
  }

  async function loadWelcome() {
    showTyping(true);
    scrollToBottom();
    try {
      const res = await fetch(`${API_URL}/api/welcome`);
      const data = await res.json();
      await delay(randomDelay());
      showTyping(false);
      addBotMessage(data.response, data.opciones);
    } catch {
      await delay(500);
      showTyping(false);
      addBotMessage('¡Hola! Soy el asistente de CADSO. ¿En qué puedo ayudarte con SolidWorks?');
    }
  }

  async function sendMessage() {
    const input = $('.cadso-chat-input input[type="text"]');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addUserMessage(text);
    history.push({ role: 'user', content: text });

    showTyping(true);
    scrollToBottom();

    try {
      const [res] = await Promise.all([
        fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history }),
        }),
        delay(randomDelay())
      ]);

      const data = await res.json();
      showTyping(false);

      if (data.error) {
        addBotMessage('Lo siento, hubo un error. ¿Podrías intentar de nuevo?');
        return;
      }

      addBotMessage(data.response, data.opciones, data.showForm);
      history.push({ role: 'assistant', content: data.response });
    } catch {
      showTyping(false);
      addBotMessage('No pude conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    }
  }

  function compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > MAX) { h = (h * MAX) / w; w = MAX; }
          if (h > MAX) { w = (w * MAX) / h; h = MAX; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    const textInput = $('.cadso-chat-input input[type="text"]');
    const userText = textInput.value.trim() || 'Analiza esta imagen';
    textInput.value = '';

    addUserImage(file, userText);
    showTyping(true);
    scrollToBottom();

    try {
      const compressed = await compressImage(file);

      const [res] = await Promise.all([
        fetch(`${API_URL}/api/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: compressed, message: userText }),
        }),
        delay(randomDelay())
      ]);

      const data = await res.json();
      showTyping(false);

      if (data.error) {
        addBotMessage(data.error);
        return;
      }

      addBotMessage(data.response);
      history.push({ role: 'assistant', content: data.response });
    } catch {
      showTyping(false);
      addBotMessage('No pude analizar la imagen. Intenta de nuevo o describe el error con texto.');
    }
  }

  function addUserImage(file, text) {
    const container = $('.cadso-chat-messages');
    const typing = $('.cadso-chat-typing');
    const msg = document.createElement('div');
    msg.className = 'cadso-msg user';

    const preview = document.createElement('img');
    preview.className = 'cadso-msg-img';
    preview.src = URL.createObjectURL(file);
    preview.alt = 'Imagen enviada';
    msg.appendChild(preview);

    if (text) {
      const p = document.createElement('div');
      p.style.marginTop = '6px';
      p.textContent = text;
      msg.appendChild(p);
    }

    container.insertBefore(msg, typing);
    requestAnimationFrame(() => msg.classList.add('visible'));
    scrollToBottom();
    history.push({ role: 'user', content: `[Imagen adjunta] ${text}` });
  }

  function addUserMessage(text) {
    const container = $('.cadso-chat-messages');
    const typing = $('.cadso-chat-typing');
    const msg = document.createElement('div');
    msg.className = 'cadso-msg user';
    msg.textContent = text;
    container.insertBefore(msg, typing);
    requestAnimationFrame(() => msg.classList.add('visible'));
    scrollToBottom();
  }

  function addBotMessage(text, opciones, showForm) {
    const container = $('.cadso-chat-messages');
    const typing = $('.cadso-chat-typing');
    const msg = document.createElement('div');
    msg.className = 'cadso-msg bot';
    msg.innerHTML = formatMarkdown(text);

    if (showForm) {
      const form = document.createElement('form');
      form.className = 'cadso-support-form';
      form.innerHTML = `
        <input type="text" name="nombre" placeholder="Tu nombre *" required />
        <input type="email" name="email" placeholder="Tu correo electrónico *" required />
        <input type="tel" name="telefono" placeholder="Tu teléfono (opcional)" />
        <textarea name="problema" placeholder="Describe tu problema *" rows="3" required></textarea>
        <label class="cadso-form-file">
          📎 Adjuntar o pegar (Ctrl+V) captura de pantalla
          <input type="file" name="imagen" accept="image/*" style="display:none" />
        </label>
        <span class="cadso-form-filename"></span>
        <button type="submit">Enviar solicitud</button>
      `;
      form.querySelector('input[name="imagen"]').addEventListener('change', (ev) => {
        const name = ev.target.files[0] ? ev.target.files[0].name : '';
        form.querySelector('.cadso-form-filename').textContent = name;
      });
      form._pastedFile = null;
      form.addEventListener('paste', (ev) => {
        const items = ev.clipboardData && ev.clipboardData.items;
        if (!items) return;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            ev.preventDefault();
            form._pastedFile = item.getAsFile();
            form.querySelector('.cadso-form-filename').textContent = '📋 Imagen pegada desde portapapeles';
            return;
          }
        }
      });
      form.onsubmit = (e) => submitSupportForm(e, form);
      msg.appendChild(form);
    }

    if (opciones && opciones.length > 0) {
      const optsDiv = document.createElement('div');
      optsDiv.className = 'cadso-msg-opciones';
      opciones.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => {
          const input = $('.cadso-chat-input input[type="text"]');
          input.value = opt;
          sendMessage();
        };
        optsDiv.appendChild(btn);
      });
      msg.appendChild(optsDiv);
    }

    container.insertBefore(msg, typing);
    requestAnimationFrame(() => msg.classList.add('visible'));
    scrollToBottom();
  }

  async function submitSupportForm(e, form) {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const imgFile = form.querySelector('input[name="imagen"]').files[0] || form._pastedFile;
    let imagen = null;
    if (imgFile) {
      imagen = await compressImage(imgFile);
    }

    const data = {
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      problema: form.problema.value.trim(),
      imagen,
    };

    try {
      const res = await fetch(`${API_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        form.innerHTML = `<div class="cadso-form-success">✅ ${result.message}</div>`;
      } else {
        btn.disabled = false;
        btn.textContent = 'Enviar solicitud';
        addBotMessage(result.error || 'Error al enviar. Intenta de nuevo.');
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Enviar solicitud';
      addBotMessage('No se pudo enviar. Verifica tu conexión.');
    }
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/🎬 Video: (https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)[^\s]*)/g,
        '<div class="cadso-video"><iframe src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen></iframe></div>')
      .replace(/🎬 Video: (https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)[^\s]*)/g,
        '<div class="cadso-video"><iframe src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen></iframe></div>')
      .replace(/\n/g, '<br>');
  }

  function showTyping(show) {
    const typing = $('.cadso-chat-typing');
    if (typing) typing.classList.toggle('show', show);
  }

  function scrollToBottom() {
    const container = $('.cadso-chat-messages');
    setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
