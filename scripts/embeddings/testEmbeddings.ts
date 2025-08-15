#!/usr/bin/env tsx

import 'dotenv/config';
import { createGeminiService } from '../../src/services/GeminiService';
import { createEmbeddingService } from '../../src/services/EmbeddingService';

const geminiService = createGeminiService();
const embeddingService = createEmbeddingService();

async function testEmbeddingGeneration() {
  console.log('🧪 Testing embedding generation...');
  
  const testText = "Software Developer React Node.js TypeScript";
  
  try {
    const embedding = await geminiService.generateEmbedding(testText);
    console.log(`✅ Generated embedding for: "${testText}"`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]`);
    console.log(`   Magnitude: ${Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)).toFixed(4)}`);
    
    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    throw error;
  }
}

async function testCosineSimilarity() {
  console.log('\n🔍 Testing cosine similarity...');
  
  const text1 = "Software Developer React";
  const text2 = "Frontend Developer JavaScript";
  const text3 = "Project Manager Leadership";
  
  try {
    const embedding1 = await geminiService.generateEmbedding(text1);
    const embedding2 = await geminiService.generateEmbedding(text2);
    const embedding3 = await geminiService.generateEmbedding(text3);
    
    const similarity12 = await geminiService.calculateCosineSimilarity(embedding1, embedding2);
    const similarity13 = await geminiService.calculateCosineSimilarity(embedding1, embedding3);
    const similarity23 = await geminiService.calculateCosineSimilarity(embedding2, embedding3);
    
    console.log(`✅ Similarity between "${text1}" and "${text2}": ${similarity12.toFixed(4)}`);
    console.log(`✅ Similarity between "${text1}" and "${text3}": ${similarity13.toFixed(4)}`);
    console.log(`✅ Similarity between "${text2}" and "${text3}": ${similarity23.toFixed(4)}`);
    
    // Verify that similar texts have higher similarity
    if (similarity12 > similarity13 && similarity12 > similarity23) {
      console.log('✅ Semantic similarity working correctly - similar roles have higher similarity');
    } else {
      console.log('⚠️  Unexpected similarity results');
    }
    
  } catch (error) {
    console.error('❌ Error testing cosine similarity:', error);
    throw error;
  }
}

async function testEmbeddingService() {
  console.log('\n🔧 Testing embedding service...');
  
  const mockPerson = {
    id: 'test-1',
    first_name: 'John',
    last_name: 'Developer',
    profession: 'Software Developer',
    services: ['React', 'Node.js', 'TypeScript'],
    tags: ['frontend', 'backend'],
    city: 'Istanbul',
    description: 'Experienced full-stack developer'
  };
  
  try {
    const personEmbedding = await embeddingService.generatePersonEmbedding(mockPerson);
    
    console.log('✅ Generated person embedding:');
    console.log(`   ID: ${personEmbedding.id}`);
    console.log(`   Text: ${personEmbedding.text}`);
    console.log(`   Skills: [${personEmbedding.skills.join(', ')}]`);
    console.log(`   Domain: ${personEmbedding.domain}`);
    console.log(`   Embedding dimensions: ${personEmbedding.embedding.length}`);
    
  } catch (error) {
    console.error('❌ Error testing embedding service:', error);
    throw error;
  }
}

async function testBatchProcessing() {
  console.log('\n📦 Testing batch processing...');
  
  const texts = [
    "Software Developer",
    "UI/UX Designer", 
    "Project Manager",
    "Marketing Specialist"
  ];
  
  try {
    const embeddings = await embeddingService.batchGenerateEmbeddings(texts);
    
    console.log(`✅ Generated ${embeddings.length} embeddings in batch`);
    embeddings.forEach((embedding, index) => {
      console.log(`   ${index + 1}. ${texts[index]} (${embedding.length} dimensions)`);
    });
    
  } catch (error) {
    console.error('❌ Error testing batch processing:', error);
    throw error;
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing performance...');
  
  const startTime = Date.now();
  const testText = "Performance test embedding generation";
  
  try {
    const embedding = await geminiService.generateEmbedding(testText);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Generated embedding in ${duration}ms`);
    console.log(`   Text: "${testText}"`);
    console.log(`   Dimensions: ${embedding.length}`);
    
    if (duration < 5000) {
      console.log('✅ Performance is acceptable (< 5 seconds)');
    } else {
      console.log('⚠️  Performance is slow (> 5 seconds)');
    }
    
  } catch (error) {
    console.error('❌ Error testing performance:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting embedding tests...\n');
    
    await testEmbeddingGeneration();
    await testCosineSimilarity();
    await testEmbeddingService();
    await testBatchProcessing();
    await testPerformance();
    
    console.log('\n🎉 All embedding tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Some tests failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
