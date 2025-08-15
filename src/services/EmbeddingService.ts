import type { PersonEmbedding, QueryEmbedding } from "@/types/hybridRetrieval";

export interface EmbeddingService {
  generatePersonEmbedding(person: any): Promise<PersonEmbedding>;
  generateQueryEmbedding(query: string, requirements: any): Promise<QueryEmbedding>;
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): Promise<number>;
  batchGenerateEmbeddings(texts: string[]): Promise<number[][]>;
}

export class GeminiEmbeddingService implements EmbeddingService {
  private apiKey: string;
  private baseURL: string;
  private model: string;
  
  constructor(apiKey: string, baseURL: string = "https://generativelanguage.googleapis.com/v1beta") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.model = "models/embedding-001";
  }
  
  async generatePersonEmbedding(person: any): Promise<PersonEmbedding> {
    const text = this.buildPersonText(person);
    const embedding = await this.generateEmbedding(text);
    
    return {
      id: person.id,
      embedding,
      text,
      skills: person.services || [],
      expertise: person.tags || [],
      tags: person.tags || [],
      languages: person.languages || [],
      locations: person.city ? [person.city] : [],
      roles: person.profession ? [person.profession] : [],
      domain: this.extractDomain(person)
    };
  }
  
  async generateQueryEmbedding(query: string, requirements: any): Promise<QueryEmbedding> {
    const text = this.buildQueryText(query, requirements);
    const embedding = await this.generateEmbedding(text);
    
    return {
      embedding,
      text,
      requirements: {
        roles: requirements.extractedRoles || [],
        skills: requirements.extractedSkills || [],
        domain: requirements.domain || "genel",
        budget: requirements.budget || "medium",
        location: requirements.location || "hybrid",
        urgency: requirements.urgency || "medium"
      }
    };
  }
  
  async calculateCosineSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same dimension");
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (norm1 * norm2);
  }
  
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches of 100 (OpenAI limit)
    const batchSize = 100;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }
  
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/${this.model}:embedContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          content: {
            parts: [{
              text: text
            }]
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.embedding.values;
    } catch (error) {
      console.error('Embedding generation error:', error);
      // Return a mock embedding for development
      return this.generateMockEmbedding(text);
    }
  }
  
  private buildPersonText(person: any): string {
    const parts = [
      person.first_name || "",
      person.last_name || "",
      person.profession || "",
      person.description || "",
      ...(person.services || []),
      ...(person.tags || []),
      person.city || ""
    ];
    
    return parts.filter(Boolean).join(" ").toLowerCase();
  }
  
  private buildQueryText(query: string, requirements: any): string {
    const parts = [
      query,
      ...(requirements.extractedRoles || []),
      ...(requirements.extractedSkills || []),
      requirements.domain || "",
      requirements.budget || "",
      requirements.location || "",
      requirements.urgency || ""
    ];
    
    return parts.filter(Boolean).join(" ").toLowerCase();
  }
  
  private extractDomain(person: any): string {
    const text = this.buildPersonText(person).toLowerCase();
    
    if (text.includes("developer") || text.includes("engineer") || text.includes("programmer")) {
      return "teknoloji";
    }
    if (text.includes("marketing") || text.includes("pazarlama")) {
      return "pazarlama";
    }
    if (text.includes("finance") || text.includes("finans") || text.includes("accounting")) {
      return "finans";
    }
    
    return "genel";
  }
  
  private generateMockEmbedding(text: string): number[] {
    // Generate a deterministic mock embedding based on text
    const mockEmbedding = new Array(768).fill(0); // Gemini uses 768 dimensions
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to generate pseudo-random but deterministic values
    for (let i = 0; i < 768; i++) {
      mockEmbedding[i] = Math.sin(hash + i) * 0.5 + 0.5;
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
    return mockEmbedding.map(val => val / magnitude);
  }
}

// Mock service for development/testing
export class MockEmbeddingService implements EmbeddingService {
  async generatePersonEmbedding(person: any): Promise<PersonEmbedding> {
    const text = this.buildPersonText(person);
    const embedding = this.generateMockEmbedding(text);
    
    return {
      id: person.id,
      embedding,
      text,
      skills: person.services || [],
      expertise: person.tags || [],
      tags: person.tags || [],
      languages: person.languages || [],
      locations: person.city ? [person.city] : [],
      roles: person.profession ? [person.profession] : [],
      domain: this.extractDomain(person)
    };
  }
  
  async generateQueryEmbedding(query: string, requirements: any): Promise<QueryEmbedding> {
    const text = this.buildQueryText(query, requirements);
    const embedding = this.generateMockEmbedding(text);
    
    return {
      embedding,
      text,
      requirements: {
        roles: requirements.extractedRoles || [],
        skills: requirements.extractedSkills || [],
        domain: requirements.domain || "genel",
        budget: requirements.budget || "medium",
        location: requirements.location || "hybrid",
        urgency: requirements.urgency || "medium"
      }
    };
  }
  
  async calculateCosineSimilarity(embedding1: number[], embedding2: number[]): Promise<number> {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (norm1 * norm2);
  }
  
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.generateMockEmbedding(text));
  }
  
  private buildPersonText(person: any): string {
    const parts = [
      person.first_name || "",
      person.last_name || "",
      person.profession || "",
      person.description || "",
      ...(person.services || []),
      ...(person.tags || []),
      person.city || ""
    ];
    
    return parts.filter(Boolean).join(" ").toLowerCase();
  }
  
  private buildQueryText(query: string, requirements: any): string {
    const parts = [
      query,
      ...(requirements.extractedRoles || []),
      ...(requirements.extractedSkills || []),
      requirements.domain || "",
      requirements.budget || "",
      requirements.location || "",
      requirements.urgency || ""
    ];
    
    return parts.filter(Boolean).join(" ").toLowerCase();
  }
  
  private extractDomain(person: any): string {
    const text = this.buildPersonText(person).toLowerCase();
    
    if (text.includes("developer") || text.includes("engineer") || text.includes("programmer")) {
      return "teknoloji";
    }
    if (text.includes("marketing") || text.includes("pazarlama")) {
      return "pazarlama";
    }
    if (text.includes("finance") || text.includes("finans") || text.includes("accounting")) {
      return "finans";
    }
    
    return "genel";
  }
  
  private generateMockEmbedding(text: string): number[] {
    const mockEmbedding = new Array(768).fill(0); // Gemini uses 768 dimensions
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    for (let i = 0; i < 768; i++) {
      mockEmbedding[i] = Math.sin(hash + i) * 0.5 + 0.5;
    }
    
    const magnitude = Math.sqrt(mockEmbedding.reduce((sum, val) => sum + val * val, 0));
    return mockEmbedding.map(val => val / magnitude);
  }
}

// Service factory
export function createEmbeddingService(): EmbeddingService {
  // Support both Vite environment variables and Node.js process.env
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  if (apiKey) {
    return new GeminiEmbeddingService(apiKey);
  } else {
    return new MockEmbeddingService();
  }
}
