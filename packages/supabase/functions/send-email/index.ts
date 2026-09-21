import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string
  subject: string
  html: string
  from?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from }: EmailPayload = await req.json()

    const smtpHost = Deno.env.get('SMTP_HOST') ?? ''
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') ?? '587')
    const smtpUser = Deno.env.get('SMTP_USER') ?? ''
    const smtpPass = Deno.env.get('SMTP_PASS') ?? ''
    const smtpFrom = from ?? Deno.env.get('SMTP_FROM') ?? 'noreply@medika.com'

    // TODO: Implementar envío real via SMTP o API de email (Resend, SendGrid, etc.)
    console.log(`Sending email to ${to} from ${smtpFrom} via ${smtpHost}:${smtpPort}`)
    console.log(`Subject: ${subject}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Email queued' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
