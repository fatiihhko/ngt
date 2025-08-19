#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createGeminiService } from '../../src/services/GeminiService';
import type { Contact } from '../../src/components/network/types';

// Supabase configuration
const supabaseUrl = "https://ysqnnassgbihnrjkcekb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc";

const supabase = createClient(supabaseUrl, supabaseKey);
const geminiService = createGeminiService();

interface PersonEmbedding {
  id: string;
  embedding: number[];
  text: string;
  skills: string[];
  expertise: string[];
  tags: string[];
  languages: string[];
  locations: string[];
  roles: string[];
  domain: string;
  created_at: string;
  updated_at: string;
}

async function getAllContacts(): Promise<Contact[]> {
  // Try to get contacts with a specific user_id (you may need to update this)
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
  
  console.log(`Raw data from Supabase:`, data?.length || 0, 'contacts found');
  
  if (data && data.length > 0) {
    console.log('Sample contact user_id:', data[0].user_id);
  }
  
  return data || [];
}

async function upsertPersonEmbedding(personEmbedding: PersonEmbedding): Promise<void> {
  const { error } = await supabase
    .from('people_embeddings')
    .upsert({
      id: personEmbedding.id,
      embedding: personEmbedding.embedding,
      text: personEmbedding.text,
      skills: personEmbedding.skills,
      expertise: personEmbedding.expertise,
      tags: personEmbedding.tags,
      languages: personEmbedding.languages,
      locations: personEmbedding.locations,
      roles: personEmbedding.roles,
      domain: personEmbedding.domain,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });
  
  if (error) {
    console.error(`Error upserting embedding for ${personEmbedding.id}:`, error);
    throw error;
  }
}

async function generatePersonEmbedding(contact: Contact): Promise<PersonEmbedding> {
  console.log(`Generating embedding for ${contact.first_name} ${contact.last_name}...`);
  
  const text = [
    contact.first_name || "",
    contact.last_name || "",
    contact.profession || "",
    contact.description || "",
    ...(contact.services || []),
    ...(contact.expertise || []), // Add expertise field
    ...(contact.tags || []),
    contact.city || ""
  ].filter(Boolean).join(" ").toLowerCase();
  
  const embedding = await geminiService.generateEmbedding(text);
  
  // Extract domain
  const domain = text.includes("developer") || text.includes("engineer") || text.includes("programmer")
    ? "teknoloji"
    : text.includes("marketing") || text.includes("pazarlama")
    ? "pazarlama"
    : text.includes("finance") || text.includes("finans") || text.includes("accounting")
    ? "finans"
    : "genel";
  
  return {
    id: contact.id,
    embedding,
    text,
    skills: contact.services || [],
    expertise: contact.expertise || [], // Use actual expertise field
    tags: contact.tags || [],
    languages: contact.languages || [], // Use actual languages field
    locations: contact.city ? [contact.city] : [],
    roles: contact.profession ? [contact.profession] : [],
    domain,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function main() {
  try {
    console.log('🚀 Starting people embeddings upsert...');
    
    // Get all contacts
    const contacts = await getAllContacts();
    console.log(`📊 Found ${contacts.length} contacts`);
    
    // Process contacts in batches to avoid rate limits
    const batchSize = 5;
    let processed = 0;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)}`);
      
      // Generate embeddings for batch
      const embeddings = await Promise.all(
        batch.map(contact => generatePersonEmbedding(contact))
      );
      
      // Upsert embeddings
      await Promise.all(
        embeddings.map(embedding => upsertPersonEmbedding(embedding))
      );
      
      processed += batch.length;
      console.log(`✅ Processed ${processed}/${contacts.length} contacts`);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < contacts.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 People embeddings upsert completed successfully!');
    
    // Verify results
    const { count } = await supabase
      .from('people_embeddings')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Total embeddings in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error during embeddings upsert:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
