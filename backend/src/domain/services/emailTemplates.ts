const BRAND_NAME = 'Asociaci&oacute;n Tur&iacute;stica Las Rocas';

const STATUS_META: Record<string, { label: string; color: string; bg: string; message: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: '#b45309',
    bg: '#fef3c7',
    message: 'Tu solicitud est&aacute; en revisi&oacute;n. Te contactaremos pronto para confirmar la disponibilidad. Si tienes preguntas, resp&oacute;ndenos a este correo.',
  },
  confirmada: {
    label: 'Confirmada',
    color: '#065f46',
    bg: '#d1fae5',
    message: '\u00a1Tu reserva est&aacute; confirmada! Te esperamos en la Asociaci&oacute;n Tur&iacute;stica Las Rocas.',
  },
  cancelada: {
    label: 'Cancelada',
    color: '#991b1b',
    bg: '#fee2e2',
    message: 'Si crees que hay un error, cont&aacute;ctanos respondiendo a este correo o escr&iacute;benos por WhatsApp.',
  },
  completada: {
    label: 'Completada',
    color: '#1d4ed8',
    bg: '#dbeafe',
    message: '\u00a1Gracias por visitarnos! Esperamos que hayas disfrutado tu experiencia en Las Rocas.',
  },
};

function headerHTML(logoUrl: string | undefined, subtitle: string): string {
  return `
    <div style="background: linear-gradient(135deg, #1a365d 0%, #1d4e7d 55%, #f16521 130%); padding: 36px 30px; text-align: center;">
      ${logoUrl
        ? `<img src="${logoUrl}" alt="${BRAND_NAME}" width="96" height="96" style="width: 96px; height: 96px; border-radius: 50%; object-fit: contain; background: #ffffff; padding: 8px; margin: 0 auto 14px; display: block; box-shadow: 0 4px 14px rgba(0,0,0,0.25);" />`
        : ''}
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; line-height: 1.35; letter-spacing: 0.3px; font-family: Arial, sans-serif;">${BRAND_NAME}</h1>
      <div style="width: 52px; height: 3px; background: #f16521; margin: 12px auto 0; border-radius: 2px;"></div>
      <p style="color: rgba(255,255,255,0.85); margin: 12px 0 0; font-size: 14px; font-family: Arial, sans-serif;">${subtitle}</p>
    </div>`;
}

function footerHTML(): string {
  return `
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 20px;">
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 4px; font-family: Arial, sans-serif;">${BRAND_NAME} &bull; Comuna San Miguel &bull; Naranjal &bull; Guayas &bull; Ecuador</p>
      <p style="color: #d1d5db; font-size: 11px; text-align: center; margin: 0; font-family: Arial, sans-serif;">Este es un correo autom&aacute;tico, por favor no respondas a este mensaje.</p>`;
}

function detailsTable(rows: Array<{ label: string; value?: string; bold?: boolean; badge?: { text: string; color: string; bg: string } }>): string {
  return `
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-family: Arial, sans-serif;">
        ${rows
          .map((row, i) => {
            const border = i < rows.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : '';
            const value = row.badge
              ? `<span style="background: ${row.badge.bg}; color: ${row.badge.color}; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: bold; text-transform: capitalize; display: inline-block;">${row.badge.text}</span>`
              : `<span style="${row.bold ? 'font-weight: bold;' : ''} color: #111827;">${row.value ?? ''}</span>`;
            return `<tr>
              <td style="padding: 12px 8px; ${border} color: #6b7280; width: 38%; font-size: 13px; vertical-align: top;">${row.label}</td>
              <td style="padding: 12px 8px; ${border} font-size: 14px; text-align: right; vertical-align: middle;">${value}</td>
            </tr>`;
          })
          .join('\n')}
      </table>`;
}

export function reservationConfirmation(data: {
  userName: string;
  serviceName: string;
  preferredDate?: Date;
  numberOfPeople?: number;
  userPhone?: string;
  message?: string;
  id: string;
  status?: string;
  logoUrl?: string;
}): string {
  const dateStr = data.preferredDate
    ? new Date(data.preferredDate).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Por confirmar';

  const status = data.status || 'pendiente';
  const meta = STATUS_META[status] || STATUS_META.pendiente;
  const isConfirmed = status === 'confirmada';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, isConfirmed ? 'Notificaci&oacute;n de reserva' : 'Solicitud de reserva')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">${isConfirmed ? '\u00a1Reserva Confirmada!' : 'Hemos recibido tu solicitud'}</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Hola <strong>${data.userName}</strong>,</p>
      <p style="color: #4b5563; margin: 8px 0 0; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">
        ${isConfirmed ? 'Tu reserva ha sido confirmada. Aqu&iacute; tienes los detalles:' : 'Gracias por elegirnos. Aqu&iacute; est&aacute;n los detalles de tu solicitud:'}
      </p>
      ${detailsTable([
        { label: 'Servicio', value: data.serviceName, bold: true },
        { label: 'Fecha', value: dateStr },
        ...(data.numberOfPeople ? [{ label: 'Personas', value: String(data.numberOfPeople) }] : []),
        ...(data.userPhone ? [{ label: 'Tel&eacute;fono', value: data.userPhone }] : []),
        ...(data.message ? [{ label: 'Mensaje', value: data.message }] : []),
        { label: 'Estado', badge: { text: meta.label, color: meta.color, bg: meta.bg } },
        { label: 'C&oacute;digo', value: data.id.slice(0, 8), bold: true },
      ])}
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">${meta.message}</p>
      ${footerHTML()}
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
  logoUrl?: string;
}): string {
  const dateStr = data.preferredDate
    ? new Date(data.preferredDate).toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Por confirmar';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, 'Nueva solicitud de reserva')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">Nueva Reserva Recibida</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Se ha registrado una nueva solicitud de reserva:</p>
      ${detailsTable([
        { label: 'Cliente', value: data.userName, bold: true },
        { label: 'Email', value: data.userEmail },
        ...(data.userPhone ? [{ label: 'Tel&eacute;fono', value: data.userPhone }] : []),
        { label: 'Servicio', value: data.serviceName, bold: true },
        { label: 'Fecha', value: dateStr },
        ...(data.numberOfPeople ? [{ label: 'Personas', value: String(data.numberOfPeople) }] : []),
        ...(data.message ? [{ label: 'Mensaje', value: data.message }] : []),
        { label: 'C&oacute;digo', value: data.id.slice(0, 8), bold: true },
      ])}
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 14px 16px; margin-top: 8px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-family: Arial, sans-serif;"><strong>Acci&oacute;n requerida:</strong> ingresa al panel administrativo para gestionar esta reserva.</p>
      </div>
      ${footerHTML()}
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetEmail(data: {
  userName: string;
  resetLink: string;
  logoUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, 'Recuperaci&oacute;n de contrase&ntilde;a')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">Restablecer Contrase&ntilde;a</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Hola <strong>${data.userName}</strong>,</p>
      <p style="color: #4b5563; margin: 8px 0 0; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">
        Recibimos una solicitud para restablecer tu contrase&ntilde;a. Haz clic en el bot&oacute;n de abajo para continuar:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${data.resetLink}" style="background: linear-gradient(135deg, #1a365d, #f16521); color: #ffffff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block; font-family: Arial, sans-serif; box-shadow: 0 4px 12px rgba(241,101,33,0.35);">Restablecer Contrase&ntilde;a</a>
      </div>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; font-family: Arial, sans-serif;">Este enlace expirar&aacute; en 15 minutos. Si no solicitaste este cambio, ignora este mensaje y tu contrase&ntilde;a permanecer&aacute; igual.</p>
      ${footerHTML()}
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
  logoUrl?: string;
}): string {
  const dateStr = new Date(data.preferredDate).toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, 'Recordatorio de reserva')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">\u00a1Tu reserva es ma&ntilde;ana!</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Hola <strong>${data.userName}</strong>,</p>
      <p style="color: #4b5563; margin: 8px 0 0; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">Te recordamos que tienes una reserva para ma&ntilde;ana. Aqu&iacute; est&aacute;n los detalles:</p>
      ${detailsTable([
        { label: 'Servicio', value: data.serviceName, bold: true },
        { label: 'Fecha', value: dateStr },
        ...(data.numberOfPeople ? [{ label: 'Personas', value: String(data.numberOfPeople) }] : []),
        { label: 'C&oacute;digo', value: data.id.slice(0, 8), bold: true },
      ])}
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">Te esperamos en la Asociaci&oacute;n Tur&iacute;stica Las Rocas. Si necesitas cancelar o modificar tu reserva, hazlo desde tu panel en nuestra web.</p>
      ${footerHTML()}
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
  logoUrl?: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, 'Nuevo mensaje de contacto')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">Nuevo Mensaje de Contacto</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Un visitante te escribi&oacute; a trav&eacute;s del formulario de contacto:</p>
      ${detailsTable([
        { label: 'Nombre', value: data.name, bold: true },
        { label: 'Email', value: data.email },
        ...(data.phone ? [{ label: 'Tel&eacute;fono', value: data.phone }] : []),
        ...(data.subject ? [{ label: 'Asunto', value: data.subject }] : []),
        { label: 'Mensaje', value: data.message },
      ])}
      <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 14px 16px; margin-top: 8px;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-family: Arial, sans-serif;"><strong>Acci&oacute;n requerida:</strong> ingresa al panel administrativo para responder este mensaje.</p>
      </div>
      ${footerHTML()}
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
  logoUrl?: string;
}): string {
  const meta = STATUS_META[data.status] || STATUS_META.pendiente;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f6f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    ${headerHTML(data.logoUrl, 'Actualizaci&oacute;n del estado de tu reserva')}
    <div style="padding: 32px;">
      <h2 style="color: #1a365d; margin: 0 0 6px; font-size: 20px; font-family: Arial, sans-serif;">Estado de tu Reserva Actualizado</h2>
      <p style="color: #4b5563; margin: 0 0 4px; font-size: 14px; font-family: Arial, sans-serif;">Hola <strong>${data.userName}</strong>,</p>
      <p style="color: #4b5563; margin: 8px 0 0; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">El estado de tu reserva para <strong>${data.serviceName}</strong> ha cambiado a:</p>
      <div style="text-align: center; margin: 26px 0;">
        <span style="background: ${meta.bg}; color: ${meta.color}; padding: 10px 30px; border-radius: 999px; font-size: 16px; font-weight: bold; text-transform: capitalize; display: inline-block; font-family: Arial, sans-serif;">${meta.label}</span>
      </div>
      ${detailsTable([
        { label: 'Servicio', value: data.serviceName, bold: true },
        { label: 'C&oacute;digo de reserva', value: data.id.slice(0, 8), bold: true },
      ])}
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;">${meta.message}</p>
      ${footerHTML()}
    </div>
  </div>
</body>
</html>`;
}
