import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { department, name, email, message } = await request.json();

    if (!department || !name || !email || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const subject = `📩 New Contact Message: ${department} — ${name}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mitrauk.com';
    const logoUrl = `${baseUrl}/assets/poster.jpg`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 28px 12px; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #2D231E;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #EAD8C7; box-shadow: 0 12px 35px rgba(139, 69, 19, 0.07);">
          <tr>
            <td style="background: linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%); padding: 32px 28px 22px; text-align: center; border-bottom: 1px solid #F3E8DF;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
                <tr>
                  <td style="width: 72px; height: 72px; border-radius: 50%; border: 2.5px solid #EA580C; background: #FFFFFF; text-align: center; vertical-align: middle; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.2);">
                    <img src="${logoUrl}" width="68" height="68" alt="MITRA UK" style="width: 68px; height: 68px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" />
                  </td>
                </tr>
              </table>
              <h1 style="font-family: 'Cinzel', Georgia, serif; color: #C2410C; font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.2px;">New Contact Submission</h1>
              <p style="color: #7C2D12; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0;">Department: ${department}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 28px; color: #2D231E; font-size: 14px; line-height: 1.7;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
                <tr>
                  <td style="color: #6B5E55; padding: 7px 0; width: 35%;">Sender Name:</td>
                  <td style="color: #2D231E; font-weight: 700;">${name}</td>
                </tr>
                <tr>
                  <td style="color: #6B5E55; padding: 7px 0;">Sender Email:</td>
                  <td style="color: #C2410C; font-family: monospace; font-weight: 600;"><a href="mailto:${email}" style="color: #C2410C; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="color: #6B5E55; padding: 7px 0;">Department:</td>
                  <td style="color: #8B1D0E; font-weight: 700;">${department}</td>
                </tr>
              </table>

              <div style="font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">Message Content:</div>
              <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 12px; padding: 18px; color: #2D231E; white-space: pre-wrap; font-size: 13.5px; line-height: 1.6;">
${message}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 24px; border-top: 1px solid #EAD8C7; text-align: center; background: #FAF5EE;">
              <p style="color: #8C7E74; font-size: 11px; margin: 0;">MITRA UK Contact Notification · <a href="${baseUrl}" style="color: #EA580C; text-decoration: none; font-weight: 700;">mitrauk.com</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const adminEmail = process.env.SMTP_FROM || 'contactus@mitrauk.com';
    const emailSent = await sendEmail(adminEmail, subject, html);

    if (!emailSent) {
      return NextResponse.json({ success: false, error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (err: unknown) {
    console.error('Error sending contact message:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
