const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendSupportEmail({ nombre, email, telefono, problema }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#2d3a50;color:white;padding:20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">Nueva solicitud de soporte - Bot CADSO</h2>
      </div>
      <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px;font-weight:bold;color:#2d3a50;width:120px;">Nombre:</td>
            <td style="padding:10px;">${nombre}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px;font-weight:bold;color:#2d3a50;">Email:</td>
            <td style="padding:10px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:bold;color:#2d3a50;">Teléfono:</td>
            <td style="padding:10px;">${telefono || 'No proporcionado'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px;font-weight:bold;color:#2d3a50;vertical-align:top;">Problema:</td>
            <td style="padding:10px;white-space:pre-wrap;">${problema}</td>
          </tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="color:#888;font-size:12px;margin:0;">Enviado desde el Bot de instalación de SolidWorks - CADSO</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Bot CADSO" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: `Solicitud de soporte - ${nombre}`,
    html,
    replyTo: email,
  });
}

module.exports = { sendSupportEmail };
