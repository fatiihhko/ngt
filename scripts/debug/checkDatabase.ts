#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://ysqnnassgbihnrjkcekb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking database structure and content...\n');
    
    // Check contacts table
    console.log('📋 Checking contacts table...');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5);
    
    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError);
    } else {
      console.log(`✅ Found ${contacts?.length || 0} contacts`);
      if (contacts && contacts.length > 0) {
        console.log('Sample contact:', JSON.stringify(contacts[0], null, 2));
      }
    }
    
    // Check people_embeddings table
    console.log('\n🧠 Checking people_embeddings table...');
    const { data: embeddings, error: embeddingsError } = await supabase
      .from('people_embeddings')
      .select('*')
      .limit(5);
    
    if (embeddingsError) {
      console.error('❌ Error fetching embeddings:', embeddingsError);
      console.log('ℹ️  people_embeddings table might not exist yet');
    } else {
      console.log(`✅ Found ${embeddings?.length || 0} embeddings`);
      if (embeddings && embeddings.length > 0) {
        console.log('Sample embedding:', {
          id: embeddings[0].id,
          text: embeddings[0].text?.substring(0, 50) + '...',
          embedding_length: embeddings[0].embedding?.length || 0
        });
      }
    }
    
    // Check table structure
    console.log('\n🏗️  Checking table structure...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('ℹ️  Could not get table names, trying alternative method...');
      // Try to query information_schema
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (schemaError) {
        console.error('❌ Error fetching schema info:', schemaError);
      } else {
        console.log('📊 Available tables:', schemaInfo?.map(t => t.table_name).join(', '));
      }
    } else {
      console.log('📊 Available tables:', tables);
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
    
    if (policiesError && policiesError.message.includes('RLS')) {
      console.log('⚠️  RLS (Row Level Security) is enabled on contacts table');
      console.log('ℹ️  You might need to authenticate or disable RLS for this script');
      console.log('💡 Try running the app and adding some contacts first');
    } else if (policiesError) {
      console.log('❌ Other error:', policiesError.message);
    } else {
      console.log('✅ RLS is not blocking access to contacts table');
    }
    
    // Check if we can access with service role
    console.log('\n🔑 Checking service role access...');
    const serviceSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);
    const { data: serviceData, error: serviceError } = await serviceSupabase
      .from('contacts')
      .select('*')
      .limit(5);
    
    if (serviceError) {
      console.log('❌ Service role also failed:', serviceError.message);
    } else {
      console.log(`✅ Service role found ${serviceData?.length || 0} contacts`);
      if (serviceData && serviceData.length > 0) {
        console.log('Sample contact with service role:', {
          id: serviceData[0].id,
          name: `${serviceData[0].first_name} ${serviceData[0].last_name}`,
          user_id: serviceData[0].user_id
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  checkDatabase();
}
