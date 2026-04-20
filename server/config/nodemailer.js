import nodemailer from 'nodemailer';

/**
 * Create transporter lazily so it reads credentials after dotenv.config() runs.
 * If created at module load time, process.env values are still undefined.
 */
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

// ─── Shared Layout Wrapper ────────────────────────────────────────────────────
const emailLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ahsaanullah</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8,#0d47a1);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:1px;">Ahsaanullah</h1>
              <p style="margin:6px 0 0;color:#c9d9f7;font-size:13px;">Hostel Management Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf0;">
              <p style="margin:0;color:#9aa0ad;font-size:12px;">
                &copy; ${new Date().getFullYear()} Ahsaanullah. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#bdc3cc;font-size:11px;">
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── OTP Block Component ──────────────────────────────────────────────────────
const otpBlock = (otp) => `
  <div style="margin:28px 0;text-align:center;">
    <p style="margin:0 0 10px;color:#555;font-size:14px;">Your one-time code is:</p>
    <div style="display:inline-block;background:#f0f4ff;border:2px dashed #1a73e8;border-radius:10px;padding:18px 36px;">
      <span style="font-size:40px;font-weight:800;letter-spacing:14px;color:#1a73e8;">${otp}</span>
    </div>
    <p style="margin:12px 0 0;color:#e53935;font-size:13px;font-weight:600;">
      &#9201; Valid for <strong>10 minutes</strong> only
    </p>
  </div>
`;

// ─── sendOTPEmail ─────────────────────────────────────────────────────────────
export const sendOTPEmail = async (to, otp, type = 'verify') => {
  const isVerify = type === 'verify';

  const subject = isVerify
    ? 'Verify Your Email — Ahsaanullah'
    : 'Password Reset OTP — Ahsaanullah';

  const content = isVerify
    ? `
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Verify Your Email Address</h2>
      <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.6;">
        Thanks for registering with <strong>Ahsaanullah</strong>!
        Please use the OTP below to verify your email address and activate your account.
      </p>
      ${otpBlock(otp)}
      <p style="color:#888;font-size:13px;line-height:1.6;">
        If you did not create an account with us, you can safely ignore this email.
      </p>
    `
    : `
      <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Password Reset Request</h2>
      <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.6;">
        We received a request to reset the password for your <strong>Ahsaanullah</strong> account.
        Use the OTP below to proceed.
      </p>
      ${otpBlock(otp)}
      <p style="color:#888;font-size:13px;line-height:1.6;">
        If you did not request a password reset, please ignore this email.
      </p>
    `;

  const mailOptions = {
    from: `"Ahsaanullah" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html: emailLayout(content),
  };

  await getTransporter().sendMail(mailOptions);
};

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (to, name) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Welcome aboard, ${name}!</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Your account has been created successfully on <strong>Ahsaanullah</strong>.
      You can now log in and start exploring the best hostels near you.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:#f0f4ff;border-left:4px solid #1a73e8;border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#1a73e8;font-size:14px;font-weight:600;">What you can do:</p>
          <ul style="margin:10px 0 0;padding-left:18px;color:#555;font-size:14px;line-height:1.9;">
            <li>Browse verified hostels</li>
            <li>Send inquiries to hostel owners</li>
            <li>Find hostels by location</li>
          </ul>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:13px;line-height:1.6;">
      If you did not create this account, please contact our support team immediately.
    </p>
  `;

  const mailOptions = {
    from: `"Ahsaanullah" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Welcome to Ahsaanullah!',
    html: emailLayout(content),
  };

  await getTransporter().sendMail(mailOptions);
};

// ─── sendHostelSubmittedEmail ─────────────────────────────────────────────────
export const sendHostelSubmittedEmail = async (to, ownerName, hostelName) => {
  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">Hostel Submitted for Review</h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Hi <strong>${ownerName}</strong>, your hostel listing has been submitted successfully and is now under admin review.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f0f4ff;border-left:4px solid #1a73e8;border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Hostel Name</span>
            <strong>${hostelName}</strong>
          </p>
          <p style="margin:12px 0 0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Status</span>
            <span style="display:inline-block;background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:600;">&#9203; Pending Review</span>
          </p>
        </td>
      </tr>
    </table>

    <p style="color:#555;font-size:14px;line-height:1.6;">
      Our team will review your listing shortly. You will receive an email once a decision has been made.
    </p>
    <p style="color:#888;font-size:13px;line-height:1.6;">
      If you have any questions, please contact our support team.
    </p>
  `;

  const mailOptions = {
    from: `"Ahsaanullah" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Hostel Submitted — Pending Admin Review',
    html: emailLayout(content),
  };

  await getTransporter().sendMail(mailOptions);
};

// ─── sendHostelStatusEmail ────────────────────────────────────────────────────
export const sendHostelStatusEmail = async (to, ownerName, hostelName, status) => {
  const isApproved = status === 'APPROVED';

  const statusBadge = isApproved
    ? `<span style="display:inline-block;background:#d4edda;color:#155724;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:600;">&#10003; Approved</span>`
    : `<span style="display:inline-block;background:#f8d7da;color:#721c24;padding:3px 12px;border-radius:20px;font-size:13px;font-weight:600;">&#10007; Rejected</span>`;

  const content = `
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;">
      Hostel ${isApproved ? 'Approved' : 'Rejected'}
    </h2>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
      Hi <strong>${ownerName}</strong>, here is the update on your hostel listing.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f8f9fb;border-left:4px solid ${isApproved ? '#28a745' : '#dc3545'};border-radius:6px;padding:16px 20px;">
          <p style="margin:0;color:#333;font-size:15px;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Hostel Name</span>
            <strong>${hostelName}</strong>
          </p>
          <p style="margin:12px 0 0;">
            <span style="color:#888;font-size:13px;display:block;margin-bottom:4px;">Decision</span>
            ${statusBadge}
          </p>
        </td>
      </tr>
    </table>

    ${isApproved
      ? `<p style="color:#555;font-size:14px;line-height:1.6;">
           Your hostel is now <strong>live</strong> and visible to users on the platform.
         </p>`
      : `<p style="color:#555;font-size:14px;line-height:1.6;">
           Unfortunately, your hostel listing did not meet our requirements. You may update and resubmit.
         </p>`
    }
    <p style="color:#888;font-size:13px;line-height:1.6;">
      If you have any questions, please contact our support team.
    </p>
  `;

  const mailOptions = {
    from: `"Ahsaanullah" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: isApproved
      ? 'Your Hostel Has Been Approved — Ahsaanullah'
      : 'Your Hostel Was Rejected — Ahsaanullah',
    html: emailLayout(content),
  };

  await getTransporter().sendMail(mailOptions);
};

export default getTransporter;
