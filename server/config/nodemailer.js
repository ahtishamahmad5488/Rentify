import nodemailer from 'nodemailer';

const getTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// ─── Shared Layout ────────────────────────────────────────────────────────────
const emailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rentify</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#3730A3);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:1px;">Rentify</h1>
              <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;">Property Rental Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf0;">
              <p style="margin:0;color:#9aa0ad;font-size:12px;">&copy; ${new Date().getFullYear()} Rentify. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#bdc3cc;font-size:11px;">This is an automated email. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp) => `
  <div style="margin:28px 0;text-align:center;">
    <p style="margin:0 0 10px;color:#555;font-size:14px;">Your one-time code is:</p>
    <div style="display:inline-block;background:#f0f4ff;border:2px dashed #4F46E5;border-radius:10px;padding:18px 36px;">
      <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#4F46E5;">${otp}</span>
    </div>
    <p style="margin:12px 0 0;color:#e53935;font-size:13px;font-weight:600;">&#9201; Valid for <strong>10 minutes</strong> only</p>
  </div>
`;

// ─── sendOTPEmail ─────────────────────────────────────────────────────────────
export const sendOTPEmail = async (to, otp, type = 'verify') => {
  const isVerify = type === 'verify';
  const subject = isVerify ? 'Verify Your Email — Rentify' : 'Password Reset OTP — Rentify';

  const content = isVerify
    ? `
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Verify Your Email Address</h2>
      <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.6;">
        Thanks for registering with <strong>Rentify</strong>! Use the OTP below to activate your account.
      </p>
      ${otpBlock(otp)}
      <p style="color:#888;font-size:13px;">If you did not create an account, you can safely ignore this email.</p>
    `
    : `
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Password Reset Request</h2>
      <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.6;">
        Use the OTP below to reset your <strong>Rentify</strong> account password.
      </p>
      ${otpBlock(otp)}
      <p style="color:#888;font-size:13px;">If you did not request a reset, please ignore this email.</p>
    `;

  await getTransporter().sendMail({
    from: `"Rentify" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: emailLayout(content),
  });
};

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (to, name) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Welcome to Rentify, ${name}!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Your account has been created. Start exploring properties near you today.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#f0f4ff;border-left:4px solid #4F46E5;border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#4F46E5;font-size:14px;font-weight:600;">What you can do:</p>
          <ul style="margin:10px 0 0;padding-left:18px;color:#555;font-size:14px;line-height:1.9;">
            <li>Browse verified rental properties</li>
            <li>Book properties online</li>
            <li>Find properties by location</li>
          </ul>
        </td>
      </tr>
    </table>
    <p style="color:#888;font-size:13px;">If you did not create this account, contact our support team.</p>
  `;

  await getTransporter().sendMail({
    from: `"Rentify" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Welcome to Rentify!',
    html: emailLayout(content),
  });
};

// ─── sendPropertySubmittedEmail ───────────────────────────────────────────────
export const sendPropertySubmittedEmail = async (to, ownerName, propertyTitle) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Property Submitted for Review</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Hi <strong>${ownerName}</strong>, your property listing has been submitted and is under admin review.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f0f4ff;border-left:4px solid #4F46E5;border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Property</span>
            <strong>${propertyTitle}</strong>
          </p>
          <p style="margin:12px 0 0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Status</span>
            <span style="display:inline-block;background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;">&#9203; Pending Review</span>
          </p>
        </td>
      </tr>
    </table>
    <p style="color:#555;font-size:14px;">You will receive an email once a decision has been made.</p>
  `;

  await getTransporter().sendMail({
    from: `"Rentify" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Property Submitted — Pending Admin Review',
    html: emailLayout(content),
  });
};

// ─── sendPropertyStatusEmail ──────────────────────────────────────────────────
export const sendPropertyStatusEmail = async (to, ownerName, propertyTitle, status) => {
  const isApproved = status === 'APPROVED';

  const statusBadge = isApproved
    ? `<span style="display:inline-block;background:#d4edda;color:#155724;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:600;">&#10003; Approved</span>`
    : `<span style="display:inline-block;background:#f8d7da;color:#721c24;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:600;">&#10007; Rejected</span>`;

  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Property ${isApproved ? 'Approved' : 'Rejected'}</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Hi <strong>${ownerName}</strong>, here is the update on your property listing.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f8f9fb;border-left:4px solid ${isApproved ? '#28a745' : '#dc3545'};border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Property</span>
            <strong>${propertyTitle}</strong>
          </p>
          <p style="margin:12px 0 0;">${statusBadge}</p>
        </td>
      </tr>
    </table>
    ${isApproved
      ? `<p style="color:#555;font-size:14px;">Your property is now <strong>live</strong> and visible on Rentify.</p>`
      : `<p style="color:#555;font-size:14px;">Your listing did not meet our requirements. You may update and resubmit.</p>`
    }
  `;

  await getTransporter().sendMail({
    from: `"Rentify" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: isApproved ? 'Your Property Has Been Approved — Rentify' : 'Your Property Was Rejected — Rentify',
    html: emailLayout(content),
  });
};

export default getTransporter;
