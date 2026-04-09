import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parallel fetch all active configuration tables for the frontend
    const [
      { data: theme },
      { data: brand },
      { data: nav },
      { data: footer_config },
      { data: footer_links }
    ] = await Promise.all([
      supabaseClient.from('theme_settings').select('key, value'),
      supabaseClient.from('brand_settings').select('*').limit(1).single(),
      supabaseClient.from('nav_config').select('*').eq('is_visible', true).order('priority'),
      supabaseClient.from('footer_config').select('*').limit(1).single(),
      supabaseClient.from('footer_links').select('*').eq('is_visible', true).order('priority')
    ])

    // Format Theme Array to Object Mapping
    const formattedTheme = (theme || []).reduce((acc: any, curr: any) => {
       acc[curr.key] = curr.value
       return acc
    }, {})

    const snapshot = {
      theme: formattedTheme,
      brand: brand || null,
      nav: nav || [],
      footer: {
         config: footer_config || null,
         links: footer_links || []
      },
      generatedAt: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(snapshot),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
