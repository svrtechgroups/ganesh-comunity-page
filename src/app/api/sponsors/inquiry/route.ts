import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, contactName, email, phone, tier, message } = body;

    if (!contactName || !email) {
      return NextResponse.json(
        { success: false, error: 'Contact name and email are required.' },
        { status: 400 }
      );
    }

    const recipient = process.env.SMTP_USER || 'contactus@mitrauk.com';
    const sponsorTier = tier || 'General Mahotsav Sponsorship';
    const companyName = company || 'Individual / Business Supporter';

    // 1. Email to MITRA Executive Team
    const adminHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 24px 12px; background-color: #080403; font-family: 'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #0D0705; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 24px 50px rgba(0,0,0,0.8);">
          <tr>
            <td style="background: linear-gradient(135deg, #7A1620 0%, #9C1F2E 50%, #5A0000 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <div style="font-size: 32px; margin-bottom: 8px;">👑</div>
              <h1 style="font-family: 'Cinzel', Georgia, serif; color: #F4C542; font-size: 20px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.2px;">New Sponsor Enquiry</h1>
              <p style="color: #F7EFE1; font-size: 12px; margin: 6px 0 0; opacity: 0.85;">London Ganesh Mahotsav 2026</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; color: #F7EFE1; font-size: 13.5px; line-height: 1.7;">
              <div style="font-size: 12px; font-weight: 800; color: #F4C542; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 12px; border-bottom: 1px solid rgba(212,175,55,0.25); padding-bottom: 6px;">
                Partner &amp; Contact Details
              </div>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="color: #C9B79C; padding: 7px 0; width: 40%;">Company / Sponsor:</td>
                  <td style="color: #FFD87A; font-weight: 700; font-size: 14px;">${companyName}</td>
                </tr>
                <tr>
                  <td style="color: #C9B79C; padding: 7px 0;">Contact Person:</td>
                  <td style="color: #FFFFFF; font-weight: 700;">${contactName}</td>
                </tr>
                <tr>
                  <td style="color: #C9B79C; padding: 7px 0;">Email:</td>
                  <td style="color: #F4C542; font-family: monospace; font-weight: 600;"><a href="mailto:${email}" style="color: #F4C542; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="color: #C9B79C; padding: 7px 0;">Phone / WhatsApp:</td>
                  <td style="color: #FFFFFF;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="color: #C9B79C; padding: 7px 0;">Sponsorship Tier:</td>
                  <td style="color: #F4C542; font-weight: 800;">${sponsorTier}</td>
                </tr>
              </table>

              ${message ? `
              <div style="font-size: 11px; font-weight: 800; color: #F4C542; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message / Proposal Notes:</div>
              <div style="background: #160B08; border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 16px; color: #F7EFE1; white-space: pre-wrap; font-size: 13px; line-height: 1.6; margin-bottom: 12px;">
                ${message}
              </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 24px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center; background: #080403;">
              <p style="color: #7D6A4F; font-size: 11px; margin: 0;">MITRA UK Sponsorship Portal · <a href="https://mitrauk.com" style="color: #D4AF37; text-decoration: none;">mitrauk.com</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email to team
    await sendEmail(recipient, `[Sponsor Lead] ${companyName} - ${contactName}`, adminHtml);

    // 2. Acknowledgment email to Sponsor
    const ackHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 24px 12px; background-color: #080403; font-family: 'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #0D0705; border-radius: 18px; overflow: hidden; border: 1px solid rgba(212, 175, 55, 0.4); box-shadow: 0 24px 50px rgba(0,0,0,0.8);">
          <tr>
            <td style="background: linear-gradient(135deg, #7A1620 0%, #9C1F2E 50%, #5A0000 100%); padding: 36px 28px 30px; text-align: center; border-bottom: 2px solid #D4AF37;">
              <div style="font-size: 36px; margin-bottom: 10px;">🕉️</div>
              <h1 style="font-family: 'Cinzel', Georgia, serif; color: #F4C542; font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: 1.5px;">Thank You For Your Support</h1>
              <p style="color: #F7EFE1; font-size: 12px; margin: 8px 0 0; opacity: 0.9;">London Ganesh Mahotsav 2026 &amp; MITRA UK</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px; color: #F7EFE1; font-size: 14px; line-height: 1.7;">
              <p style="color: #F7EFE1; font-size: 16px; margin: 0 0 16px;">
                Namaste <strong style="color: #F4C542;">${contactName}</strong> 🙏,
              </p>
              <p style="color: #C9B79C; font-size: 13.5px; line-height: 1.7; margin: 0 0 20px;">
                Thank you for expressing interest in partnering with <strong>MITRA UK</strong> for the upcoming <strong>London Ganesh Mahotsav 2026</strong>.
              </p>
              <p style="color: #C9B79C; font-size: 13.5px; line-height: 1.7; margin: 0 0 24px;">
                Our Sponsorship Coordination Team has received your inquiry for <strong style="color: #FFD87A;">${sponsorTier}</strong> and will reach out to you shortly with our official sponsorship pack and partnership options.
              </p>

              <!-- Direct Contact Box -->
              <div style="background: #160B08; border: 1px solid rgba(212,175,55,0.4); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 800; color: #F4C542; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">Direct Sponsorship Inquiries</div>
                <p style="color: #C9B79C; font-size: 13px; margin: 0;">
                  Email: <a href="mailto:contactus@mitrauk.com" style="color: #F4C542; text-decoration: none; font-weight: 600;">contactus@mitrauk.com</a><br/>
                  Phone: <strong style="color: #FFFFFF;">+44 7404 530041</strong>
                </p>
              </div>

              <p style="color: #7D6A4F; font-size: 12px; margin: 0;">
                Warm regards,<br/>
                <strong style="color: #C9B79C;">MITRA UK Executive Committee</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 18px 24px; border-top: 1px solid rgba(212,175,55,0.2); text-align: center; background: #080403;">
              <p style="color: #7D6A4F; font-size: 11px; margin: 0;">MITRA UK · <a href="https://mitrauk.com" style="color: #D4AF37; text-decoration: none;">mitrauk.com</a></p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendEmail(email, '🙏 MITRA UK — Sponsorship Inquiry Received', ackHtml);

    return NextResponse.json({
      success: true,
      message: 'Sponsorship inquiry email sent successfully.',
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send sponsorship enquiry';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
