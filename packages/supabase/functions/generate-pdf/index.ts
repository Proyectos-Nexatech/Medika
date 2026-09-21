import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PdfPayload {
  templateType: string
  data: Record<string, unknown>
  patientId: string
  organizationId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateType, data, patientId, organizationId }: PdfPayload = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // TODO: Implementar generación real de PDF
    // Opciones: Puppeteer, jsPDF, html-pdf-node, PDFKit
    console.log(`Generating ${templateType} PDF for patient ${patientId} in org ${organizationId}`)
    console.log('Data:', JSON.stringify(data, null, 2))

    // Placeholder: guardar metadata en documents
    const storagePath = `${organizationId}/documents/${patientId}/${templateType}_${Date.now()}.pdf`

    return new Response(
      JSON.stringify({ success: true, storagePath }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
