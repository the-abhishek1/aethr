// Email service using Resend
// Set RESEND_API_KEY in your .env to enable emails
// Get a free key at resend.com — 3,000 emails/month free

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'Aethr <notifications@aethr.world>'

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  if (!RESEND_API_KEY) {
    // Silently skip if no key configured — don't break the app
    console.log(`[Email skipped - no RESEND_API_KEY] To: ${to}, Subject: ${subject}`)
    return { success: false, reason: 'no_key' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    })
    const data = await res.json()
    return { success: res.ok, data }
  } catch (err) {
    console.error('[Email error]', err)
    return { success: false }
  }
}

// Email templates
export function notificationEmail(username: string, title: string, body: string, link: string) {
  const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${link}`
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#04040a;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:28px;font-weight:700;letter-spacing:0.15em;color:#e8e4f0;text-transform:uppercase;">
        <span style="color:#a89bff;">Æ</span>thr
      </span>
    </div>

    <!-- Card -->
    <div style="background:#080814;border:0.5px solid rgba(180,170,255,0.18);border-radius:4px;padding:32px;">
      <p style="margin:0 0 8px;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(232,228,240,0.45);">
        Hey @${username}
      </p>
      <h2 style="margin:0 0 16px;font-size:22px;font-weight:300;color:#e8e4f0;line-height:1.3;">
        ${title}
      </h2>
      <p style="margin:0 0 28px;font-family:'DM Mono',monospace;font-size:13px;line-height:1.8;color:rgba(232,228,240,0.6);">
        ${body}
      </p>
      <a href="${url}" style="display:inline-block;background:#a89bff;color:#04040a;text-decoration:none;padding:12px 28px;border-radius:2px;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:500;">
        Enter the galaxy →
      </a>
    </div>

    <!-- Footer -->
    <p style="margin:24px 0 0;text-align:center;font-family:'DM Mono',monospace;font-size:11px;color:rgba(232,228,240,0.22);">
      Aethr · The fifth element, inhabited<br>
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile" style="color:rgba(232,228,240,0.22);">Manage notifications</a>
    </p>
  </div>
</body>
</html>`
}

export function welcomeEmail(username: string) {
  return notificationEmail(
    username,
    'Welcome to Aethr.',
    'Your identity has been forged. The galaxy awaits. Eight worlds. Infinite selves. Your reputation belongs to you.',
    '/dashboard'
  )
}

export function messageEmail(username: string, fromUsername: string, preview: string) {
  return notificationEmail(
    username,
    `Message from @${fromUsername}`,
    preview,
    '/messages'
  )
}
