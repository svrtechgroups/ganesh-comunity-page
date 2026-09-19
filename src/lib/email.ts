import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

export const sendEmail = async (to: string, subject: string, html: string) => {
  // If SMTP is not properly configured, just log the email (useful for local dev before setting .env)
  if (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.example.com') {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: \n${html}\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MITRA <contactus@mitrauk.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// ── Light Theme Email Layout Wrapper (Matches Home Landing Page) ───────────────

interface EmailLayoutOptions {
  pageTitle: string;
  badgeText?: string;
  children: string;
  footerNote?: string;
  isAlert?: boolean;
}

export function renderEmailLayout({
  pageTitle,
  badgeText = 'London Ganesh Mahotsav 2026',
  children,
  footerNote = 'If you did not make this request, you can safely ignore this email.',
  isAlert = false,
}: EmailLayoutOptions) {
  const currentYear = new Date().getFullYear();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk';
  const logoUrl = `${baseUrl}/assets/poster.jpg`;

  const borderColor = isAlert ? 'rgba(239, 68, 68, 0.35)' : '#EAD8C7';
  const headerBg = isAlert
    ? 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)'
    : 'linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${pageTitle}</title>
    </head>
    <body style="margin: 0; padding: 28px 12px; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2D231E;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid ${borderColor}; box-shadow: 0 12px 35px rgba(139, 69, 19, 0.07);">
        
        <!-- Header with Website Logo -->
        <tr>
          <td style="background: ${headerBg}; padding: 34px 28px 24px; text-align: center; border-bottom: 1px solid #F3E8DF;">
            
            <!-- Circular Website Logo -->
            <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
              <tr>
                <td style="width: 72px; height: 72px; border-radius: 50%; border: 2.5px solid #EA580C; background: #FFFFFF; text-align: center; vertical-align: middle; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.2);">
                  <img src="${logoUrl}" width="68" height="68" alt="MITRA UK Logo" style="width: 68px; height: 68px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" />
                </td>
              </tr>
            </table>

            <!-- Brand Typography -->
            <h1 style="font-family: 'Cinzel', Georgia, 'Times New Roman', serif; color: #C2410C; font-size: 23px; font-weight: 900; margin: 0; letter-spacing: 1.5px; text-transform: uppercase;">
              MITRA UK
            </h1>
            <p style="color: #7C2D12; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 4px 0 0;">
              MANA INDIAN TELUGU ROOTS ABROAD
            </p>

            <!-- Event / Badge -->
            ${
              badgeText
                ? `
            <div style="display: inline-block; background: ${isAlert ? '#FEE2E2' : '#FFF7ED'}; border: 1px solid ${isAlert ? '#FCA5A5' : '#FDBA74'}; color: ${isAlert ? '#991B1B' : '#C2410C'}; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 50px; margin-top: 14px; letter-spacing: 0.5px;">
              ${badgeText}
            </div>`
                : ''
            }
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding: 32px 30px; background: #FFFFFF; color: #2D231E; font-size: 14px; line-height: 1.7;">
            ${children}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding: 24px 28px; border-top: 1px solid #EAD8C7; text-align: center; background: #FAF5EE;">
            <p style="color: #C2410C; font-size: 12px; font-weight: 800; margin: 0 0 4px; letter-spacing: 1px; text-transform: uppercase;">
              MITRA UK · Mana Indian Telugu Roots Abroad
            </p>
            <p style="color: #6B5E55; font-size: 11px; margin: 0 0 8px;">
              Slough &amp; London Community Hub · <a href="${baseUrl}" style="color: #EA580C; text-decoration: none; font-weight: 700;">mitra.org.uk</a>
            </p>
            <p style="color: #8C7E74; font-size: 10.5px; margin: 0; line-height: 1.5;">
              ${footerNote}<br/>
              © ${currentYear} MITRA UK. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
}

// ── 1. OTP Email (Register & Forgot Password) ──────────────────────────────────

export const sendOTP = async (to: string, code: string, type: 'REGISTER' | 'FORGOT_PASSWORD') => {
  const isRegister = type === 'REGISTER';
  const subject = isRegister
    ? '🕉️ Your MITRA UK Registration Verification Code'
    : '🔐 Your MITRA UK Password Reset Code';

  const title = isRegister ? 'Account Registration Verification' : 'Password Reset Verification';
  const badge = isRegister ? 'Welcome to MITRA UK' : 'Secure Account Verification';

  const body = `
    <h2 style="font-family: 'Cinzel', Georgia, serif; color: #8B1D0E; font-size: 18px; font-weight: 800; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.8px;">
      ${title}
    </h2>
    <p style="color: #2D231E; font-size: 14.5px; margin: 0 0 16px;">
      Namaste 🙏,
    </p>
    <p style="color: #4A3B32; font-size: 13.5px; line-height: 1.7; margin: 0 0 24px;">
      ${
        isRegister
          ? 'Thank you for registering with <strong>MITRA UK</strong>. Please enter the one-time verification code below to verify your email and activate your devotee account:'
          : 'We received a request to reset your password for your <strong>MITRA UK</strong> devotee account. Please use the one-time verification code below to continue:'
      }
    </p>

    <!-- OTP Display Box (Light Theme with Saffron/Orange Accent) -->
    <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 14px; padding: 22px 16px; text-align: center; margin: 0 0 24px; box-shadow: 0 6px 18px rgba(234, 88, 12, 0.08);">
      <div style="font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
        One-Time Verification Code
      </div>
      <div style="font-size: 36px; font-weight: 900; color: #C2410C; letter-spacing: 8px; font-family: monospace; padding: 6px 0;">
        ${code}
      </div>
      <div style="font-size: 11.5px; color: #7C2D12; font-weight: 600; margin-top: 6px;">
        ⏳ Valid for <strong style="color: #C2410C;">10 minutes</strong> only
      </div>
    </div>

    <!-- Security Information Box -->
    <div style="background: #FEF3C7; border-left: 3.5px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
      <p style="color: #78350F; font-size: 12px; margin: 0; line-height: 1.6;">
        <strong style="color: #B45309;">🔒 Security Tip:</strong> Never share your verification OTP with anyone. MITRA UK team members will never ask for your code.
      </p>
    </div>

    <p style="color: #8C7E74; font-size: 12px; line-height: 1.6; margin: 0;">
      If you did not request this OTP, you can safely ignore this email. Your account remains completely secure.
    </p>
  `;

  const html = renderEmailLayout({
    pageTitle: title,
    badgeText: badge,
    children: body,
  });

  return sendEmail(to, subject, html);
};

// ── 2. Guest Welcome Email ────────────────────────────────────────────────────

export const sendGuestWelcomeEmail = async (
  to: string,
  fullName: string,
  tempPassword: string
) => {
  const subject = '🙏 Welcome to MITRA UK — Your Account Login Details';
  const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk'}/login`;

  const body = `
    <h2 style="font-family: 'Cinzel', Georgia, serif; color: #8B1D0E; font-size: 18px; font-weight: 800; margin: 0 0 14px; text-transform: uppercase; letter-spacing: 0.8px;">
      Devotee Account Created
    </h2>
    <p style="color: #2D231E; font-size: 15px; margin: 0 0 14px;">
      Namaste <strong style="color: #C2410C;">${fullName}</strong> 🙏,
    </p>
    <p style="color: #4A3B32; font-size: 13.5px; line-height: 1.7; margin: 0 0 22px;">
      Your <strong>MITRA UK</strong> membership account has been created so you can access your Pooja bookings, seva booking receipts, and festival passes seamlessly.
    </p>

    <!-- Credentials Card (Light Theme) -->
    <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 14px; padding: 20px; margin-bottom: 24px; box-shadow: 0 6px 18px rgba(234, 88, 12, 0.08);">
      <div style="font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; border-bottom: 1px solid #FED7AA; padding-bottom: 6px;">
        🔑 Your Login Credentials
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #6B5E55; font-size: 12.5px; padding: 7px 0; width: 40%;">Registered Email:</td>
          <td style="color: #2D231E; font-size: 13px; font-weight: 700; font-family: monospace;">${to}</td>
        </tr>
        <tr>
          <td style="color: #6B5E55; font-size: 12.5px; padding: 7px 0;">Temporary Password:</td>
          <td style="color: #C2410C; font-size: 16px; font-weight: 900; font-family: monospace; letter-spacing: 1.5px;">${tempPassword}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button (Saffron / Orange Gradient Pill) -->
    <div style="text-align: center; margin: 26px 0 22px;">
      <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%); color: #FFFFFF; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 14px 36px; border-radius: 50px; text-decoration: none; box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);">
        Login to Devotee Portal →
      </a>
    </div>

    <!-- Security Note -->
    <div style="background: #FEF3C7; border-left: 3.5px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0;">
      <p style="color: #78350F; font-size: 12px; line-height: 1.6; margin: 0;">
        <strong style="color: #B45309;">🔐 Note:</strong> This is a one-time temporary password. Please update your password after logging in via the <em>Forgot Password</em> link.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    pageTitle: 'Welcome to MITRA UK',
    badgeText: 'Devotee Membership Portal',
    children: body,
  });

  return sendEmail(to, subject, html);
};

// ── 3. Payment Failure Alert Email ────────────────────────────────────────────

export interface PaymentFailureDetails {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  amount?: number | string;
  currency?: string;
  cause?: string;
  paymentIntentId?: string;
  failureReason?: string;
  errorCode?: string;
  declineCode?: string;
  source?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export const sendPaymentFailureAlert = async (details: PaymentFailureDetails) => {
  const recipient =
    process.env.REPORT_MAIL ||
    process.env.SMTP_USER ||
    'lingampally.venkey@gmail.com';

  const amountStr = details.amount !== undefined ? `£${Number(details.amount).toFixed(2)}` : 'N/A';
  const currencyStr = (details.currency || 'GBP').toUpperCase();
  const devoteeName = details.customerName || 'Devotee / Customer';
  const devoteeEmail = details.customerEmail || 'Not Provided';
  const devoteePhone = details.customerPhone || 'Not Provided';
  const cause = details.cause || 'MITRA Community Contribution';
  const reason = details.failureReason || 'Card declined / Payment processing error';
  const intentId = details.paymentIntentId || 'N/A';
  const code = details.declineCode || details.errorCode || 'PAYMENT_FAILED';
  const source = details.source || 'Stripe Gateway';
  const timeStr = details.timestamp || new Date().toUTCString();

  const subject = `🚨 Payment Failure Alert: ${amountStr} ${currencyStr} from ${devoteeName}`;
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://mitra.org.uk'}/admin/payments`;

  const body = `
    <!-- Top Alert Box (Light Rose & Red) -->
    <div style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #991B1B; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; padding-bottom: 4px;">Attempted Amount</td>
          <td style="color: #991B1B; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; text-align: right; padding-bottom: 4px;">Status</td>
        </tr>
        <tr>
          <td style="color: #991B1B; font-size: 28px; font-weight: 900; font-family: monospace;">${amountStr} <span style="font-size: 14px; color: #B91C1C;">${currencyStr}</span></td>
          <td style="text-align: right;">
            <span style="background: #EF4444; color: #FFFFFF; font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.8px;">FAILED</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Devotee & Cause Details -->
    <div style="font-size: 12px; font-weight: 800; color: #8B1D0E; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 10px; border-bottom: 1.5px solid #FED7AA; padding-bottom: 6px;">
      Devotee &amp; Booking Details
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; font-size: 13px;">
      <tr>
        <td style="color: #6B5E55; padding: 7px 0; width: 38%;">Devotee / Customer:</td>
        <td style="color: #2D231E; font-weight: 700;">${devoteeName}</td>
      </tr>
      <tr>
        <td style="color: #6B5E55; padding: 7px 0;">Customer Email:</td>
        <td style="color: #C2410C; font-weight: 600; font-family: monospace;">${devoteeEmail}</td>
      </tr>
      <tr>
        <td style="color: #6B5E55; padding: 7px 0;">Customer Phone:</td>
        <td style="color: #2D231E;">${devoteePhone}</td>
      </tr>
      <tr>
        <td style="color: #6B5E55; padding: 7px 0;">Pooja / Event / Cause:</td>
        <td style="color: #8B1D0E; font-weight: 700;">${cause}</td>
      </tr>
    </table>

    <!-- Failure Diagnostics Box -->
    <div style="font-size: 12px; font-weight: 800; color: #DC2626; text-transform: uppercase; letter-spacing: 1.2px; margin: 0 0 10px; border-bottom: 1.5px solid #FECACA; padding-bottom: 6px;">
      Failure Diagnostics &amp; Telemetry
    </div>
    <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
        <tr>
          <td style="color: #6B7280; padding: 5px 0; width: 35%;">Reason / Error:</td>
          <td style="color: #DC2626; font-weight: 700;">${reason}</td>
        </tr>
        <tr>
          <td style="color: #6B7280; padding: 5px 0;">Decline Code:</td>
          <td style="color: #DC2626; font-family: monospace; font-weight: 800;">${code}</td>
        </tr>
        <tr>
          <td style="color: #6B7280; padding: 5px 0;">Payment Intent ID:</td>
          <td style="color: #4B5563; font-family: monospace; word-break: break-all;">${intentId}</td>
        </tr>
        <tr>
          <td style="color: #6B7280; padding: 5px 0;">Trigger Source:</td>
          <td style="color: #4B5563;">${source}</td>
        </tr>
        <tr>
          <td style="color: #6B7280; padding: 5px 0;">Timestamp (UTC):</td>
          <td style="color: #6B7280; font-size: 11.5px;">${timeStr}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0 10px;">
      <a href="${adminUrl}" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #FFFFFF; font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 13px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 6px 18px rgba(220,38,38,0.3);">
        View In Payments Portal →
      </a>
    </div>
  `;

  const html = renderEmailLayout({
    pageTitle: 'Payment Failure Notification',
    badgeText: 'High Priority Alert',
    isAlert: true,
    children: body,
    footerNote: `This automated security notification was sent to ${recipient}.`,
  });

  console.log(`[PAYMENT FAILURE EMAIL] Sending alert to ${recipient} for ${devoteeName} (${amountStr})...`);
  return sendEmail(recipient, subject, html);
};

// ── 4. Event Registration & Payment Confirmation Email ────────────────────────

export interface EventRegistrationConfirmationParams {
  recipientEmail: string;
  recipientName: string;
  eventName: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventAddress?: string;
  totalAmount?: number;
  supportAmount?: number;
  ticketsCount?: number;
  adultsCount?: number;
  childrenCount?: number;
  selectedDates?: string[];
  paymentIntentId?: string;
  rsvpId?: string;
}

export const sendEventRegistrationConfirmationEmail = async (
  params: EventRegistrationConfirmationParams
) => {
  const {
    recipientEmail,
    recipientName,
    eventName,
    eventDate = 'Sunday, 18 October 2026',
    eventTime = '4:30 PM onwards',
    eventVenue = 'Thurrock Rugby Football Club, Oakfield, Long Lane, Grays, Essex, RM16 2QH',
    eventAddress = '',
    totalAmount = 0,
    supportAmount = 0,
    ticketsCount = 1,
    adultsCount = 1,
    childrenCount = 0,
    selectedDates = [],
    paymentIntentId,
    rsvpId,
  } = params;

  const isBathukamma =
    eventName.toLowerCase().includes('bathukamma') ||
    eventName.toLowerCase().includes('grays');

  const subject = isBathukamma
    ? '🌸 Registration & Payment Confirmed — MITRA Grays Bathukamma 2026'
    : `🎟️ Registration & Payment Confirmed — ${eventName}`;

  const badgeText = isBathukamma ? 'MITRA Grays Bathukamma 2026' : eventName;

  // Render Venue & Schedule
  const displayDate = isBathukamma ? 'Sunday, 18 October 2026' : (eventDate || 'Sunday, 18 October 2026');
  const displayTime = isBathukamma ? '4:30 PM onwards' : (eventTime || '4:30 PM onwards');
  const displayVenue = isBathukamma
    ? 'Thurrock Rugby Football Club, Oakfield, Long Lane, Grays, Essex, RM16 2QH'
    : `${eventVenue}${eventAddress ? `, ${eventAddress}` : ''}`;

  const body = `
    <!-- Top Welcome Message -->
    <p style="color: #2D231E; font-size: 15px; margin: 0 0 16px;">
      Namaste <strong>${recipientName}</strong> 🙏,
    </p>

    <p style="color: #2D231E; font-size: 14.5px; line-height: 1.7; margin: 0 0 22px;">
      ${
        isBathukamma
          ? 'Thank you for registering and making your payment for <strong>MITRA Grays Bathukamma 2026</strong>. We’re delighted to confirm your registration and look forward to welcoming you and your family.'
          : `Thank you for registering and making your payment for <strong>${eventName}</strong>. We’re delighted to confirm your registration and look forward to welcoming you and your family.`
      }
    </p>

    <!-- Event Schedule & Location Card -->
    <div style="background: #FFF8F0; border: 1.5px solid #FDBA74; border-radius: 16px; padding: 22px 20px; margin: 0 0 22px; box-shadow: 0 6px 18px rgba(234, 88, 12, 0.08);">
      <div style="font-size: 11px; font-weight: 800; color: #EA580C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; border-bottom: 1px solid #FED7AA; padding-bottom: 6px;">
        🌺 Event Schedule &amp; Venue
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; line-height: 1.6;">
        <tr>
          <td style="padding: 6px 0; width: 34px; vertical-align: top; font-size: 16px;">📅</td>
          <td style="padding: 6px 0; color: #2D231E; font-weight: 700;">${displayDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; width: 34px; vertical-align: top; font-size: 16px;">⏰</td>
          <td style="padding: 6px 0; color: #2D231E; font-weight: 700;">${displayTime}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; width: 34px; vertical-align: top; font-size: 16px;">📍</td>
          <td style="padding: 6px 0; color: #2D231E; font-weight: 700;">
            ${displayVenue}
          </td>
        </tr>
      </table>
    </div>

    <!-- Booking Details Summary -->
    <div style="background: #FAF5EE; border: 1px solid #EAD8C7; border-radius: 14px; padding: 18px 20px; margin: 0 0 22px;">
      <div style="font-size: 11px; font-weight: 800; color: #7C2D12; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px; border-bottom: 1px solid #E5D5C5; padding-bottom: 4px;">
        🎟️ Confirmed Booking Summary
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 5px 0; color: #6B5E55;">Devotee / Attendee:</td>
          <td style="padding: 5px 0; color: #2D231E; font-weight: 700; text-align: right;">${recipientName}</td>
        </tr>
        <tr>
          <td style="padding: 5px 0; color: #6B5E55;">Registered Email:</td>
          <td style="padding: 5px 0; color: #2D231E; font-family: monospace; font-size: 12px; text-align: right;">${recipientEmail}</td>
        </tr>
        ${
          adultsCount > 0
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55;">Adult Passes (Above 5 yrs):</td>
                <td style="padding: 5px 0; color: #2D231E; font-weight: 700; text-align: right;">${adultsCount}</td>
              </tr>`
            : ''
        }
        ${
          childrenCount > 0
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55;">Children Passes (Below 5 yrs):</td>
                <td style="padding: 5px 0; color: #2D231E; font-weight: 700; text-align: right;">${childrenCount}</td>
              </tr>`
            : ''
        }
        ${
          ticketsCount > 0
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55;">Total Passes:</td>
                <td style="padding: 5px 0; color: #2D231E; font-weight: 700; text-align: right;">${ticketsCount}</td>
              </tr>`
            : ''
        }
        ${
          selectedDates && selectedDates.length > 0
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55;">Selected Dates:</td>
                <td style="padding: 5px 0; color: #C2410C; font-weight: 700; text-align: right;">${selectedDates.join(', ')}</td>
              </tr>`
            : ''
        }
        ${
          totalAmount > 0
            ? `<tr>
                <td style="padding: 7px 0; color: #6B5E55; font-weight: 700; border-top: 1px dashed #E5D5C5;">Total Amount Paid:</td>
                <td style="padding: 7px 0; color: #15803D; font-weight: 900; font-size: 16px; text-align: right; border-top: 1px dashed #E5D5C5;">£${Number(totalAmount).toFixed(2)}</td>
              </tr>`
            : `<tr>
                <td style="padding: 5px 0; color: #6B5E55; border-top: 1px dashed #E5D5C5;">Pass Type:</td>
                <td style="padding: 5px 0; color: #15803D; font-weight: 700; text-align: right; border-top: 1px dashed #E5D5C5;">Free Admission Entry</td>
              </tr>`
        }
        ${
          supportAmount > 0
            ? `<tr>
                <td style="padding: 4px 0; color: #6B5E55; font-size: 12px;">Includes Event Support:</td>
                <td style="padding: 4px 0; color: #B45309; font-weight: 700; font-size: 12px; text-align: right;">£${Number(supportAmount).toFixed(2)}</td>
              </tr>`
            : ''
        }
        ${
          paymentIntentId
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55; font-size: 11px;">Payment Reference:</td>
                <td style="padding: 5px 0; color: #6B5E55; font-family: monospace; font-size: 11px; text-align: right;">${paymentIntentId}</td>
              </tr>`
            : ''
        }
        ${
          rsvpId
            ? `<tr>
                <td style="padding: 5px 0; color: #6B5E55; font-size: 11px;">Pass Reference ID:</td>
                <td style="padding: 5px 0; color: #6B5E55; font-family: monospace; font-size: 11px; text-align: right;">${rsvpId}</td>
              </tr>`
            : ''
        }
      </table>
    </div>

    <!-- Celebration Note -->
    <p style="color: #2D231E; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
      ${
        isBathukamma
          ? 'Get ready for a wonderful evening celebrating flowers, culture and togetherness, with family fun, DJ, food and traditional Bathukamma celebrations.'
          : 'Get ready for a memorable cultural gathering with our vibrant diaspora community, wonderful traditions, authentic food, and festive celebrations.'
      }
    </p>

    <p style="color: #2D231E; font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
      Thank you for your support, and we look forward to celebrating with you!
    </p>

    <!-- Warm regards Sign-Off -->
    <div style="border-top: 1px solid #EAD8C7; padding-top: 18px; margin-top: 20px;">
      <p style="color: #2D231E; font-size: 14px; margin: 0 0 4px;">
        Warm regards,
      </p>
      <p style="color: #C2410C; font-size: 14px; font-weight: 800; margin: 0 0 2px;">
        ${isBathukamma ? 'Team MITRA Grays' : 'Team MITRA UK'}
      </p>
      <p style="color: #7C2D12; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0;">
        Mana Indian Telugu Roots Abroad
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    pageTitle: subject,
    badgeText,
    children: body,
  });

  console.log(`[CONFIRMATION EMAIL] Sending registration confirmation to ${recipientEmail} for ${eventName}...`);
  return sendEmail(recipientEmail, subject, html);
};

