#!/usr/bin/env tsx

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://ysqnnassgbihnrjkcekb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc";

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data with 15 different profession groups
const mockContacts = [
  // Technology/Software
  {
    first_name: "Ahmet",
    last_name: "Yılmaz",
    profession: "Founder & CEO",
    city: "İstanbul",
    relationship_degree: 5,
    services: ["startup", "leadership", "strategy"],
    tags: ["girişimci", "lider", "vizyoner"],
    phone: "05551234567",
    email: "ahmet@techstartup.com",
    description: "10+ yıl deneyimli girişimci, 3 başarılı exit yaptı",
    user_id: "d98e9a65-df8a-4456-9b0e-bfe6b6f4b9a2" // Use existing user_id
  },
  {
    first_name: "Zeynep",
    last_name: "Kaya",
    profession: "CTO",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["software architecture", "team leadership", "cloud"],
    tags: ["teknoloji", "mimari", "lider"],
    phone: "05551234568",
    email: "zeynep@techstartup.com",
    description: "Senior software architect, AWS certified",
    user_id: "d98e9a65-df8a-4456-9b0e-bfe6b6f4b9a2"
  },
  {
    first_name: "Mehmet",
    last_name: "Demir",
    profession: "Senior Frontend Developer",
    city: "İstanbul",
    relationship_degree: 3,
    services: ["react", "typescript", "ui/ux"],
    tags: ["frontend", "react", "typescript"],
    phone: "05551234569",
    email: "mehmet@techstartup.com",
    description: "React expert, 8 yıl deneyim"
  },
  {
    first_name: "Ayşe",
    last_name: "Özkan",
    profession: "Backend Developer",
    city: "Ankara",
    relationship_degree: 3,
    services: ["node.js", "python", "database"],
    tags: ["backend", "node.js", "python"],
    phone: "05551234570",
    email: "ayse@techstartup.com",
    description: "Full-stack developer, database specialist"
  },

  // Design & Creative
  {
    first_name: "Elif",
    last_name: "Çelik",
    profession: "UI/UX Designer",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["figma", "user research", "prototyping"],
    tags: ["design", "ui/ux", "figma"],
    phone: "05551234571",
    email: "elif@designstudio.com",
    description: "Award-winning designer, 6 yıl deneyim"
  },
  {
    first_name: "Can",
    last_name: "Arslan",
    profession: "Creative Director",
    city: "İzmir",
    relationship_degree: 3,
    services: ["branding", "creative strategy", "art direction"],
    tags: ["creative", "branding", "strategy"],
    phone: "05551234572",
    email: "can@creativeagency.com",
    description: "Creative director, 12 yıl deneyim"
  },

  // Business & Finance
  {
    first_name: "Fatma",
    last_name: "Şahin",
    profession: "Business Development Manager",
    city: "İstanbul",
    relationship_degree: 5,
    services: ["partnerships", "sales", "market analysis"],
    tags: ["business", "sales", "partnerships"],
    phone: "05551234573",
    email: "fatma@business.com",
    description: "Business development expert, 10 yıl deneyim"
  },
  {
    first_name: "Ali",
    last_name: "Yıldız",
    profession: "Financial Advisor",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["investment", "financial planning", "risk management"],
    tags: ["finance", "investment", "planning"],
    phone: "05551234574",
    email: "ali@finance.com",
    description: "Certified financial advisor, 15 yıl deneyim"
  },

  // Marketing & Growth
  {
    first_name: "Selin",
    last_name: "Kurt",
    profession: "Growth Marketing Manager",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["digital marketing", "growth hacking", "analytics"],
    tags: ["marketing", "growth", "analytics"],
    phone: "05551234575",
    email: "selin@growth.com",
    description: "Growth marketing specialist, 7 yıl deneyim"
  },
  {
    first_name: "Burak",
    last_name: "Koç",
    profession: "Content Marketing Specialist",
    city: "Ankara",
    relationship_degree: 3,
    services: ["content strategy", "seo", "social media"],
    tags: ["content", "seo", "social media"],
    phone: "05551234576",
    email: "burak@content.com",
    description: "Content marketing expert, 5 yıl deneyim"
  },

  // Operations & HR
  {
    first_name: "Deniz",
    last_name: "Aydın",
    profession: "Operations Manager",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["process optimization", "team management", "project management"],
    tags: ["operations", "management", "process"],
    phone: "05551234577",
    email: "deniz@operations.com",
    description: "Operations expert, 9 yıl deneyim"
  },
  {
    first_name: "Gizem",
    last_name: "Öz",
    profession: "HR Manager",
    city: "İstanbul",
    relationship_degree: 3,
    services: ["recruitment", "employee relations", "hr strategy"],
    tags: ["hr", "recruitment", "people"],
    phone: "05551234578",
    email: "gizem@hr.com",
    description: "HR professional, 8 yıl deneyim"
  },

  // Legal & Compliance
  {
    first_name: "Emre",
    last_name: "Türk",
    profession: "Legal Counsel",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["corporate law", "contracts", "compliance"],
    tags: ["legal", "corporate", "compliance"],
    phone: "05551234579",
    email: "emre@legal.com",
    description: "Corporate lawyer, 11 yıl deneyim"
  },

  // Sales & Customer Success
  {
    first_name: "Merve",
    last_name: "Kara",
    profession: "Sales Director",
    city: "İstanbul",
    relationship_degree: 5,
    services: ["enterprise sales", "customer success", "account management"],
    tags: ["sales", "enterprise", "customer"],
    phone: "05551234580",
    email: "merve@sales.com",
    description: "Sales leader, 13 yıl deneyim"
  },

  // Product & Strategy
  {
    first_name: "Kaan",
    last_name: "Erdoğan",
    profession: "Product Manager",
    city: "İstanbul",
    relationship_degree: 4,
    services: ["product strategy", "user research", "roadmap"],
    tags: ["product", "strategy", "research"],
    phone: "05551234581",
    email: "kaan@product.com",
    description: "Product manager, 6 yıl deneyim"
  }
];

// Relationship connections (who knows whom)
const relationships = [
  // Founder connections
  { source: "Ahmet Yılmaz", target: "Zeynep Kaya", strength: 5 },
  { source: "Ahmet Yılmaz", target: "Fatma Şahin", strength: 5 },
  { source: "Ahmet Yılmaz", target: "Merve Kara", strength: 4 },
  { source: "Ahmet Yılmaz", target: "Emre Türk", strength: 4 },

  // CTO connections
  { source: "Zeynep Kaya", target: "Mehmet Demir", strength: 4 },
  { source: "Zeynep Kaya", target: "Ayşe Özkan", strength: 4 },
  { source: "Zeynep Kaya", target: "Kaan Erdoğan", strength: 3 },

  // Developer connections
  { source: "Mehmet Demir", target: "Elif Çelik", strength: 3 },
  { source: "Ayşe Özkan", target: "Mehmet Demir", strength: 3 },

  // Design connections
  { source: "Elif Çelik", target: "Can Arslan", strength: 4 },
  { source: "Elif Çelik", target: "Kaan Erdoğan", strength: 3 },

  // Business connections
  { source: "Fatma Şahin", target: "Selin Kurt", strength: 4 },
  { source: "Fatma Şahin", target: "Ali Yıldız", strength: 3 },
  { source: "Fatma Şahin", target: "Merve Kara", strength: 4 },

  // Marketing connections
  { source: "Selin Kurt", target: "Burak Koç", strength: 3 },
  { source: "Selin Kurt", target: "Elif Çelik", strength: 3 },

  // Operations connections
  { source: "Deniz Aydın", target: "Gizem Öz", strength: 4 },
  { source: "Deniz Aydın", target: "Kaan Erdoğan", strength: 3 },

  // Sales connections
  { source: "Merve Kara", target: "Fatma Şahin", strength: 4 },
  { source: "Merve Kara", target: "Selin Kurt", strength: 3 },

  // Product connections
  { source: "Kaan Erdoğan", target: "Zeynep Kaya", strength: 3 },
  { source: "Kaan Erdoğan", target: "Elif Çelik", strength: 3 }
];

async function createMockData() {
  try {
    console.log('🚀 Creating comprehensive mock data...');
    
    // Clear existing contacts (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing contacts...');
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy
    
    if (deleteError) {
      console.error('Error clearing contacts:', deleteError);
    } else {
      console.log('✅ Existing contacts cleared');
    }
    
    // Add user_id to all contacts
    const contactsWithUserId = mockContacts.map(contact => ({
      ...contact,
      user_id: "d98e9a65-df8a-4456-9b0e-bfe6b6f4b9a2"
    }));
    
    // Insert mock contacts
    console.log('👥 Inserting mock contacts...');
    const { data: insertedContacts, error: insertError } = await supabase
      .from('contacts')
      .insert(contactsWithUserId)
      .select();
    
    if (insertError) {
      console.error('Error inserting contacts:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedContacts?.length || 0} contacts inserted successfully`);
    
    // Create relationships (parent_contact_id connections)
    console.log('🔗 Creating relationships...');
    const relationshipUpdates = [];
    
    for (const rel of relationships) {
      const sourceContact = insertedContacts?.find(c => 
        `${c.first_name} ${c.last_name}` === rel.source
      );
      const targetContact = insertedContacts?.find(c => 
        `${c.first_name} ${c.last_name}` === rel.target
      );
      
      if (sourceContact && targetContact) {
        relationshipUpdates.push({
          id: targetContact.id,
          parent_contact_id: sourceContact.id
        });
      }
    }
    
    // Update contacts with relationships
    for (const update of relationshipUpdates) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ parent_contact_id: update.parent_contact_id })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating relationship for ${update.id}:`, updateError);
      }
    }
    
    console.log(`✅ ${relationshipUpdates.length} relationships created`);
    
    // Display summary
    console.log('\n📊 Mock Data Summary:');
    console.log(`👥 Total Contacts: ${insertedContacts?.length || 0}`);
    console.log(`🔗 Total Relationships: ${relationshipUpdates.length}`);
    
    console.log('\n🎯 Profession Groups:');
    const professionGroups = [...new Set(mockContacts.map(c => c.profession))];
    professionGroups.forEach(profession => {
      const count = mockContacts.filter(c => c.profession === profession).length;
      console.log(`  • ${profession}: ${count} kişi`);
    });
    
    console.log('\n🎉 Mock data creation completed successfully!');
    console.log('💡 Now you can test the AI Assistant with diverse professional network!');
    
  } catch (error) {
    console.error('❌ Error creating mock data:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createMockData();
}
