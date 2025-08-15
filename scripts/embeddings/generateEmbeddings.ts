#!/usr/bin/env tsx

import 'dotenv/config';
import { createGeminiService } from '../../src/services/GeminiService';

const geminiService = createGeminiService();

// Sample test data
const testTexts = [
  "Software Developer React Node.js TypeScript",
  "UI/UX Designer Figma Adobe XD Prototyping",
  "Project Manager Agile Scrum Leadership",
  "Digital Marketing Specialist SEO Content Marketing",
  "Financial Analyst Accounting Business Analysis",
  "Mobile Developer iOS Android React Native",
  "Backend Developer Python Django PostgreSQL",
  "Frontend Developer Vue.js JavaScript CSS",
  "Data Scientist Machine Learning Python R",
  "DevOps Engineer Docker Kubernetes AWS"
];

async function generateTestEmbeddings() {
  console.log('🧪 Generating test embeddings...');
  
  const embeddings: { text: string; embedding: number[] }[] = [];
  
  for (const text of testTexts) {
    console.log(`📝 Processing: ${text}`);
    const embedding = await geminiService.generateEmbedding(text);
    embeddings.push({ text, embedding });
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Generated embeddings:');
  embeddings.forEach((item, index) => {
    console.log(`${index + 1}. ${item.text}`);
    console.log(`   Dimensions: ${item.embedding.length}`);
    console.log(`   Sample values: [${item.embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log('');
  });
  
  // Test cosine similarity
  console.log('🔍 Testing cosine similarity...');
  const similarity = await geminiService.calculateCosineSimilarity(
    embeddings[0].embedding,
    embeddings[1].embedding
  );
  console.log(`Similarity between "${embeddings[0].text}" and "${embeddings[1].text}": ${similarity.toFixed(4)}`);
  
  return embeddings;
}

async function testSemanticSearch() {
  console.log('\n🎯 Testing semantic search...');
  
  const query = "web development team";
  const queryEmbedding = await geminiService.generateEmbedding(query);
  
  const candidates = [
    "Software Developer React Node.js TypeScript",
    "UI/UX Designer Figma Adobe XD Prototyping",
    "Project Manager Agile Scrum Leadership",
    "Mobile Developer iOS Android React Native"
  ];
  
  const results: { candidate: string; similarity: number }[] = [];
  
  for (const candidate of candidates) {
    const candidateEmbedding = await geminiService.generateEmbedding(candidate);
    const similarity = await geminiService.calculateCosineSimilarity(queryEmbedding, candidateEmbedding);
    results.push({ candidate, similarity });
  }
  
  // Sort by similarity
  results.sort((a, b) => b.similarity - a.similarity);
  
  console.log(`Query: "${query}"`);
  console.log('Results (sorted by similarity):');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.candidate} (${result.similarity.toFixed(4)})`);
  });
}

async function main() {
  try {
    console.log('🚀 Starting embedding generation tests...\n');
    
    await generateTestEmbeddings();
    await testSemanticSearch();
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during embedding generation:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
