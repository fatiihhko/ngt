#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://ysqnnassgbihnrjkcekb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function tempDisableRLS() {
  try {
    console.log('🔓 Temporarily disabling RLS for embedding operations...');
    
    // Create a temporary policy that allows all operations for embedding scripts
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies temporarily
        DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
        
        -- Create temporary policy for embedding operations
        CREATE POLICY "temp_embedding_access" ON public.contacts
        FOR ALL USING (true);
      `
    });
    
    if (policyError) {
      console.error('❌ Error modifying RLS policies:', policyError);
      console.log('💡 You may need to run this manually in Supabase SQL Editor');
      console.log('📝 SQL to run:');
      console.log(`
        -- Drop existing policies temporarily
        DROP POLICY IF EXISTS "Users can view their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can update their own contacts" ON public.contacts;
        DROP POLICY IF EXISTS "Users can delete their own contacts" ON public.contacts;
        
        -- Create temporary policy for embedding operations
        CREATE POLICY "temp_embedding_access" ON public.contacts
        FOR ALL USING (true);
      `);
    } else {
      console.log('✅ RLS temporarily disabled for embedding operations');
      console.log('⚠️  Remember to re-enable RLS after embedding operations');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function reEnableRLS() {
  try {
    console.log('🔒 Re-enabling RLS policies...');
    
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop temporary policy
        DROP POLICY IF EXISTS "temp_embedding_access" ON public.contacts;
        
        -- Re-create original policies
        CREATE POLICY "Users can view their own contacts" ON public.contacts
        FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own contacts" ON public.contacts
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own contacts" ON public.contacts
        FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own contacts" ON public.contacts
        FOR DELETE USING (auth.uid() = user_id);
      `
    });
    
    if (policyError) {
      console.error('❌ Error re-enabling RLS policies:', policyError);
      console.log('💡 You may need to run this manually in Supabase SQL Editor');
    } else {
      console.log('✅ RLS policies re-enabled');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'disable') {
    tempDisableRLS();
  } else if (command === 'enable') {
    reEnableRLS();
  } else {
    console.log('Usage: npm run rls:disable or npm run rls:enable');
  }
}
