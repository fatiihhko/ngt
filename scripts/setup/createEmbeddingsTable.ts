#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://ysqnnassgbihnrjkcekb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmbeddingsTable() {
  try {
    console.log('🏗️  Creating people_embeddings table...');
    
    // Create people_embeddings table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.people_embeddings (
          id uuid PRIMARY KEY REFERENCES public.contacts(id) ON DELETE CASCADE,
          embedding vector(768),
          text text NOT NULL,
          skills text[] NOT NULL DEFAULT '{}',
          expertise text[] NOT NULL DEFAULT '{}',
          tags text[] NOT NULL DEFAULT '{}',
          languages text[] NOT NULL DEFAULT '{}',
          locations text[] NOT NULL DEFAULT '{}',
          roles text[] NOT NULL DEFAULT '{}',
          domain text NOT NULL DEFAULT 'genel',
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      
      // Try alternative approach without vector extension
      console.log('🔄 Trying alternative approach without vector extension...');
      const { error: altError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.people_embeddings (
            id uuid PRIMARY KEY REFERENCES public.contacts(id) ON DELETE CASCADE,
            embedding jsonb NOT NULL,
            text text NOT NULL,
            skills text[] NOT NULL DEFAULT '{}',
            expertise text[] NOT NULL DEFAULT '{}',
            tags text[] NOT NULL DEFAULT '{}',
            languages text[] NOT NULL DEFAULT '{}',
            locations text[] NOT NULL DEFAULT '{}',
            roles text[] NOT NULL DEFAULT '{}',
            domain text NOT NULL DEFAULT 'genel',
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
          );
        `
      });
      
      if (altError) {
        console.error('❌ Error creating table with alternative approach:', altError);
        return;
      }
    }
    
    console.log('✅ people_embeddings table created successfully!');
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.people_embeddings ENABLE ROW LEVEL SECURITY;
      `
    });
    
    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
    } else {
      console.log('✅ RLS enabled on people_embeddings table');
    }
    
    // Create policies
    const policies = [
      {
        name: "Users can view their own contact embeddings",
        sql: "CREATE POLICY \"Users can view their own contact embeddings\" ON public.people_embeddings FOR SELECT USING (EXISTS (SELECT 1 FROM public.contacts WHERE contacts.id = people_embeddings.id AND contacts.user_id = auth.uid()));"
      },
      {
        name: "Users can insert their own contact embeddings",
        sql: "CREATE POLICY \"Users can insert their own contact embeddings\" ON public.people_embeddings FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.contacts WHERE contacts.id = people_embeddings.id AND contacts.user_id = auth.uid()));"
      },
      {
        name: "Users can update their own contact embeddings",
        sql: "CREATE POLICY \"Users can update their own contact embeddings\" ON public.people_embeddings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.contacts WHERE contacts.id = people_embeddings.id AND contacts.user_id = auth.uid()));"
      },
      {
        name: "Users can delete their own contact embeddings",
        sql: "CREATE POLICY \"Users can delete their own contact embeddings\" ON public.people_embeddings FOR DELETE USING (EXISTS (SELECT 1 FROM public.contacts WHERE contacts.id = people_embeddings.id AND contacts.user_id = auth.uid()));"
      }
    ];
    
    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });
      
      if (policyError) {
        console.log(`⚠️  Policy ${policy.name} might already exist:`, policyError.message);
      } else {
        console.log(`✅ Policy ${policy.name} created`);
      }
    }
    
    // Create trigger for updated_at
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.update_embeddings_updated_at()
        RETURNS trigger AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_people_embeddings_updated_at ON public.people_embeddings;
        
        CREATE TRIGGER update_people_embeddings_updated_at
        BEFORE UPDATE ON public.people_embeddings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_embeddings_updated_at();
      `
    });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
    } else {
      console.log('✅ Trigger for updated_at created');
    }
    
    console.log('\n🎉 people_embeddings table setup completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createEmbeddingsTable();
}
