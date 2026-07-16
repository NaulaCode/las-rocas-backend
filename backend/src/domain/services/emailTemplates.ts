export function reservationConfirmation(data: {
  userName: string;
  serviceName: string;
  preferredDate?: Date;
  numberOfPeople?: number;
  userPhone?: string;
  message?: string;
  id: string;
  status?: string;
}): string {
  const dateStr = data.preferredDate
    ? new Date(data.preferredDate).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Por confirmar';

  const statusColors: Record<string, string> = { pendiente: '#f59e0b', confirmada: '#10b981', cancelada: '#ef4444', completada: '#3b82f6' };
  const statusLabel = data.status || 'pendiente';
  const isConfirmed = statusLabel === 'confirmada';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">${isConfirmed ? 'Reserva confirmada' : 'Asociaci\u00f3n Tur\u00edstica'}</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">${isConfirmed ? '\u00a1Reserva Confirmada!' : 'Solicitud de Reserva Recibida'}</h2>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>${isConfirmed ? 'Tu reserva ha sido confirmada. Aqu\u00ed tienes los detalles:' : 'Hemos recibido tu solicitud de reserva correctamente. Aqu\u00ed tienes los detalles:'}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Servicio</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.serviceName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Fecha</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${dateStr}</td></tr>
        ${data.numberOfPeople ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Personas</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.numberOfPeople}</td></tr>` : ''}
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Estado</td><td style="padding: 10px; border-bottom: 1px solid #eee;"><span style="background: ${statusColors[statusLabel] || '#6b7280'}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 12px; text-transform: capitalize;">${statusLabel}</span></td></tr>
        <tr><td style="padding: 10px; color: #666;">C\u00f3digo</td><td style="padding: 10px; font-family: monospace; color: #666;">${data.id.slice(0, 8)}</td></tr>
      </table>
      <p style="color: #666; font-size: 14px;">${isConfirmed ? 'Gracias por confiar en nosotros. Te esperamos en Las Rocas.' : 'Te contactaremos pronto para confirmar la disponibilidad. Si tienes preguntas, responde a este correo o escr\u00edbenos al WhatsApp.'}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">Asociaci\u00f3n Tur\u00edstica Las Rocas &bull; Comunidad San Miguel - Naranjal - Ecuador</p>
    </div>
  </div>
</body>
</html>`;
}

export function adminNewReservation(data: {
  userName: string;
  userEmail: string;
  userPhone?: string;
  serviceName: string;
  preferredDate?: Date;
  numberOfPeople?: number;
  message?: string;
  id: string;
}): string {
  const dateStr = data.preferredDate
    ? new Date(data.preferredDate).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Por confirmar';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Nueva solicitud de reserva</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">Nueva Reserva Recibida</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Cliente</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.userName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.userEmail}</td></tr>
        ${data.userPhone ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Tel&eacute;fono</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.userPhone}</td></tr>` : ''}
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Servicio</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.serviceName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Fecha</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${dateStr}</td></tr>
        ${data.numberOfPeople ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Personas</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.numberOfPeople}</td></tr>` : ''}
        ${data.message ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Mensaje</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.message}</td></tr>` : ''}
      </table>
      <p style="color: #666; font-size: 14px;">Ingresa al panel administrativo para gestionar esta reserva.</p>
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetEmail(data: {
  userName: string;
  resetLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Recuperaci&oacute;n de contrase&ntilde;a</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">Restablecer Contrase&ntilde;a</h2>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>Recibimos una solicitud para restablecer tu contrase&ntilde;a. Haz clic en el bot&oacute;n de abajo para continuar:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${data.resetLink}" style="background: linear-gradient(135deg, #1a365d, #f16521); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Restablecer Contrase&ntilde;a</a>
      </div>
      <p style="color: #666; font-size: 14px;">Este enlace expirar&aacute; en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">Asociaci&oacute;n Tur&iacute;stica Las Rocas &bull; Comunidad San Miguel - Naranjal - Ecuador</p>
    </div>
  </div>
</body>
</html>`;
}

export function reservationReminder(data: {
  userName: string;
  serviceName: string;
  preferredDate: Date;
  numberOfPeople?: number;
  id: string;
}): string {
  const dateStr = new Date(data.preferredDate).toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Recordatorio de reserva</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">¡Tu reserva es mañana!</h2>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>Te recordamos que tienes una reserva para mañana. Aqu&iacute; est&aacute;n los detalles:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Servicio</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.serviceName}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Fecha</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${dateStr}</td></tr>
        ${data.numberOfPeople ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Personas</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.numberOfPeople}</td></tr>` : ''}
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">C&oacute;digo</td><td style="padding: 10px; font-family: monospace; color: #666;">${data.id.slice(0, 8)}</td></tr>
      </table>
      <p style="color: #666; font-size: 14px;">Te esperamos en Las Rocas. Si necesitas cancelar o modificar, hazlo desde tu panel en nuestra web.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px; text-align: center;">Asociaci&oacute;n Tur&iacute;stica Las Rocas &bull; Comunidad San Miguel - Naranjal - Ecuador</p>
    </div>
  </div>
</body>
</html>`;
}

export function adminNewContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Nuevo mensaje de contacto</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">Nuevo Mensaje de Contacto</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Nombre</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.name}</td></tr>
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Email</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.email}</td></tr>
        ${data.phone ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Tel&eacute;fono</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.phone}</td></tr>` : ''}
        ${data.subject ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Asunto</td><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${data.subject}</td></tr>` : ''}
        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Mensaje</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td></tr>
      </table>
      <p style="color: #666; font-size: 14px;">Ingresa al panel administrativo para responder este mensaje.</p>
    </div>
  </div>
</body>
</html>`;
}

export function reservationStatusChange(data: {
  userName: string;
  serviceName: string;
  status: string;
  id: string;
}): string {
  const statusColors: Record<string, string> = { confirmada: '#10b981', cancelada: '#ef4444', completada: '#3b82f6' };
  const color = statusColors[data.status] || '#6b7280';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: linear-gradient(135deg, #1a365d, #f16521); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Las Rocas</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #1a365d; margin: 0 0 20px;">Estado de tu Reserva Actualizado</h2>
      <p>Hola <strong>${data.userName}</strong>,</p>
      <p>El estado de tu reserva para <strong>${data.serviceName}</strong> ha cambiado a:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="background: ${color}; color: white; padding: 8px 24px; border-radius: 20px; font-size: 16px; font-weight: bold; text-transform: capitalize;">${data.status}</span>
      </div>
      <p style="color: #666; font-size: 14px;">C&oacute;digo de reserva: <strong>${data.id.slice(0, 8)}</strong></p>
      ${data.status === 'confirmada' ? '<p>¡Tu reserva est&aacute; confirmada! Te esperamos pronto.</p>' : ''}
      ${data.status === 'cancelada' ? '<p>Si crees que hay un error, cont&aacute;ctanos.</p>' : ''}
    </div>
  </div>
</body>
</html>`;
}
