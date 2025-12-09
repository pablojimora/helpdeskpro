import nodemailer from 'nodemailer';

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verificar configuración (opcional)
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✓ Servidor de correo configurado correctamente');
    return true;
  } catch (error) {
    console.error('✗ Error en configuración de correo:', error);
    return false;
  }
};

interface TicketEmailData {
  clientEmail: string;
  clientName: string;
  ticketId: string;
  ticketTitle: string;
  ticketDescription: string;
}

interface CommentEmailData {
  clientEmail: string;
  clientName: string;
  ticketId: string;
  ticketTitle: string;
  agentName: string;
  commentMessage: string;
}

interface CloseTicketEmailData {
  clientEmail: string;
  clientName: string;
  ticketId: string;
  ticketTitle: string;
  closedAt: Date;
}

// Email cuando se crea un ticket
export const sendTicketCreatedEmail = async (data: TicketEmailData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: data.clientEmail,
      subject: `Ticket Creado: ${data.ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .ticket-info { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎫 HelpDeskPro</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.clientName},</h2>
              <p>Tu ticket de soporte ha sido creado exitosamente.</p>
              
              <div class="ticket-info">
                <p><span class="label">ID del Ticket:</span> ${data.ticketId}</p>
                <p><span class="label">Título:</span> ${data.ticketTitle}</p>
                <p><span class="label">Descripción:</span></p>
                <p style="white-space: pre-wrap;">${data.ticketDescription}</p>
              </div>
              
              <p>Nuestro equipo de soporte revisará tu solicitud y te responderá a la brevedad posible.</p>
              <p>Puedes hacer seguimiento de tu ticket en cualquier momento desde tu panel de cliente.</p>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>© 2025 HelpDeskPro - Sistema de Gestión de Tickets</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email de creación enviado a ${data.clientEmail}`);
    return true;
  } catch (error) {
    console.error('✗ Error enviando email de creación:', error);
    return false;
  }
};

// Email cuando un agente responde (agrega comentario)
export const sendAgentResponseEmail = async (data: CommentEmailData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: data.clientEmail,
      subject: `Nueva Respuesta en tu Ticket: ${data.ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .response { background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
            .label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 Nueva Respuesta</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.clientName},</h2>
              <p>Has recibido una nueva respuesta en tu ticket de soporte.</p>
              
              <p><span class="label">Ticket:</span> ${data.ticketTitle}</p>
              <p><span class="label">Respondido por:</span> ${data.agentName}</p>
              
              <div class="response">
                <p style="white-space: pre-wrap;">${data.commentMessage}</p>
              </div>
              
              <p>Puedes ver todos los detalles y continuar la conversación en tu panel de cliente.</p>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>© 2025 HelpDeskPro - Sistema de Gestión de Tickets</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email de respuesta enviado a ${data.clientEmail}`);
    return true;
  } catch (error) {
    console.error('✗ Error enviando email de respuesta:', error);
    return false;
  }
};

// Email cuando se cierra un ticket
export const sendTicketClosedEmail = async (data: CloseTicketEmailData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: data.clientEmail,
      subject: `Ticket Cerrado: ${data.ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #6b7280; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .label { font-weight: bold; color: #6b7280; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Ticket Cerrado</h1>
            </div>
            <div class="content">
              <h2>Hola ${data.clientName},</h2>
              <p>Tu ticket de soporte ha sido cerrado.</p>
              
              <div class="info-box">
                <p><span class="label">ID del Ticket:</span> ${data.ticketId}</p>
                <p><span class="label">Título:</span> ${data.ticketTitle}</p>
                <p><span class="label">Fecha de cierre:</span> ${new Date(data.closedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <p>Esperamos que tu problema haya sido resuelto satisfactoriamente.</p>
              <p>Si necesitas ayuda adicional, no dudes en crear un nuevo ticket.</p>
              <p>¡Gracias por usar HelpDeskPro!</p>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>© 2025 HelpDeskPro - Sistema de Gestión de Tickets</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email de cierre enviado a ${data.clientEmail}`);
    return true;
  } catch (error) {
    console.error('✗ Error enviando email de cierre:', error);
    return false;
  }
};
