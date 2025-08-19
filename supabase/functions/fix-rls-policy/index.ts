import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Drop existing policy
    const { error: dropError } = await supabaseClient.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;'
    })

    if (dropError) {
      console.error('Error dropping policy:', dropError)
    }

    // Create new policy that allows users to view:
    // 1. Contacts they created directly (user_id = auth.uid())
    // 2. Contacts created via their invite links (user_id = invite_links.created_by_user_id)
    const { error: createError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view their own contacts and invite-created contacts" ON public.contacts
        FOR SELECT USING (
          auth.uid() = user_id OR
          EXISTS (
            SELECT 1 FROM public.invite_links 
            WHERE created_by_user_id = auth.uid() 
            AND id IN (
              SELECT invite_link_id FROM public.invite_members 
              WHERE contact_id = contacts.id
            )
          )
        );
      `
    })

    if (createError) {
      console.error('Error creating policy:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'RLS policy updated successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
