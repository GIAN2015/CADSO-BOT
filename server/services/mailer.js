const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendSupportEmail({ nombre, email, telefono, problema, imagen }) {
  const hasImage = imagen && imagen.startsWith('data:image');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #ddd;border-radius:12px;overflow:hidden;">
      <div style="background:#2d3a50;padding:24px 20px;text-align:center;">
        <h2 style="margin:0;color:#ffffff;font-size:20px;">Nueva solicitud de soporte</h2>
        <p style="margin:6px 0 0;color:#e8762a;font-size:14px;font-weight:600;">Bot CADSO - SolidWorks</p>
      </div>
      <div style="padding:24px 20px;background:#ffffff;">
        <table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:12px 16px;font-weight:bold;color:#2d3a50;width:120px;background:#f8f8f8;border-bottom:1px solid #eee;">Nombre</td>
            <td style="padding:12px 16px;color:#333;border-bottom:1px solid #eee;">${nombre}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:bold;color:#2d3a50;background:#f8f8f8;border-bottom:1px solid #eee;">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #eee;"><a href="mailto:${email}" style="color:#e8762a;text-decoration:none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:bold;color:#2d3a50;background:#f8f8f8;border-bottom:1px solid #eee;">Teléfono</td>
            <td style="padding:12px 16px;color:#333;border-bottom:1px solid #eee;">${telefono || 'No proporcionado'}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;font-weight:bold;color:#2d3a50;background:#f8f8f8;vertical-align:top;">Problema</td>
            <td style="padding:12px 16px;color:#333;white-space:pre-wrap;line-height:1.5;">${problema}</td>
          </tr>
        </table>
        ${hasImage ? `
        <div style="margin-top:20px;">
          <p style="margin:0 0 10px;font-weight:bold;color:#2d3a50;font-size:14px;">📎 Captura adjunta:</p>
          <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;display:inline-block;">
            <img src="cid:captura" style="max-width:100%;height:auto;display:block;" />
          </div>
        </div>
        ` : ''}
      </div>
      <div style="background:#f5f5f5;padding:16px 20px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;color:#999;font-size:11px;">Enviado desde el Bot de instalación de SolidWorks — CADSO</p>
        <p style="margin:4px 0 0;color:#999;font-size:11px;">Para responder al cliente, use el botón "Responder" de su correo.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Bot CADSO" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: `Solicitud de soporte - ${nombre}`,
    html,
    replyTo: email,
  };

  if (hasImage) {
    const matches = imagen.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches) {
      mailOptions.attachments = [{
        filename: `captura_${nombre.replace(/\s+/g, '_')}.${matches[1]}`,
        content: matches[2],
        encoding: 'base64',
        cid: 'captura',
      }];
    }
  }

  await transporter.sendMail(mailOptions);
}

module.exports = { sendSupportEmail };
