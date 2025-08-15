import type { Contact } from "@/components/network/types";
import type { TeamRequirement, TeamRecommendation } from "@/utils/ragSystem";

// Gemini Service Interface
export interface GeminiService {
  analyzeProject(description: string, contacts: Contact[]): Promise<{
    requirements: TeamRequirement;
    reasoning: string;
    suggestedTeamSize: number;
  }>;
  
  generateTeamRecommendations(
    requirements: TeamRequirement,
    scoredCandidates: any[]
  ): Promise<TeamRecommendation[]>;
  
  extractRolesFromProject(description: string): Promise<string[]>;
  
  suggestTeamSize(description: string): Promise<number>;
  
  generateEmbedding(text: string): Promise<number[]>;
  
  calculateCosineSimilarity(embedding1: number[], embedding2: number[]): Promise<number>;
}

// Gemini Service Implementation
export class GeminiServiceImpl implements GeminiService {
  private apiKey: string;
  private baseURL: string;
  private embeddingModel: string;
  private chatModel: string;
  
  constructor(apiKey: string, baseURL: string = "https://generativelanguage.googleapis.com/v1beta") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.embeddingModel = "models/embedding-001";
    this.chatModel = "models/gemini-1.5-flash";
  }
  
  async analyzeProject(description: string, contacts: Contact[]): Promise<{
    requirements: TeamRequirement;
    reasoning: string;
    suggestedTeamSize: number;
  }> {
    const prompt = `
    Proje açıklaması: "${description}"
    
    Bu proje için gerekli olan:
    1. Ekip büyüklüğü (kaç kişi)
    2. Roller (hangi pozisyonlar)
    3. Beceriler (hangi yetenekler)
    4. Domain (hangi sektör)
    5. Öncelik seviyesi (düşük/orta/yüksek)
    6. Bütçe seviyesi (düşük/orta/yüksek)
    7. Lokasyon tercihi (yerel/uzaktan/hibrit)
    
    JSON formatında yanıtla:
    {
      "teamSize": 3,
      "roles": ["Frontend Developer", "Backend Developer", "UI/UX Designer"],
      "skills": ["web", "tasarım"],
      "domain": "teknoloji",
      "urgency": "medium",
      "budget": "medium",
      "location": "hybrid",
      "reasoning": "Proje analizi açıklaması"
    }
    `;
    
    try {
      const response = await fetch(`${this.baseURL}/${this.chatModel}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from Gemini');
      }
      
      const result = JSON.parse(jsonMatch[0]);
      
      const requirements: TeamRequirement = {
        description,
        teamSize: result.teamSize,
        extractedRoles: result.roles,
        extractedSkills: result.skills,
        domain: result.domain,
        urgency: result.urgency,
        budget: result.budget,
        location: result.location
      };
      
      return {
        requirements,
        reasoning: result.reasoning,
        suggestedTeamSize: result.teamSize
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback to mock service
      const mockService = new MockGeminiService();
      return mockService.analyzeProject(description, contacts);
    }
  }
  
  async generateTeamRecommendations(
    requirements: TeamRequirement,
    scoredCandidates: any[]
  ): Promise<TeamRecommendation[]> {
    // AI-powered team recommendation logic
    return [];
  }
  
  async extractRolesFromProject(description: string): Promise<string[]> {
    const prompt = `
    Proje açıklaması: "${description}"
    
    Bu proje için gerekli olan rolleri listele (sadece rol isimleri, virgülle ayır):
    `;
    
    try {
      const response = await fetch(`${this.baseURL}/${this.chatModel}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      return content.split(',').map((role: string) => role.trim());
    } catch (error) {
      console.error('Gemini API Error:', error);
      const mockService = new MockGeminiService();
      return mockService.extractRolesFromProject(description);
    }
  }
  
  async suggestTeamSize(description: string): Promise<number> {
    const prompt = `
    Proje açıklaması: "${description}"
    
    Bu proje için uygun ekip büyüklüğü kaç kişi olmalı? Sadece sayıyı yanıtla:
    `;
    
    try {
      const response = await fetch(`${this.baseURL}/${this.chatModel}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 64
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      return parseInt(content) || 3;
    } catch (error) {
      console.error('Gemini API Error:', error);
      const mockService = new MockGeminiService();
      return mockService.suggestTeamSize(description);
    }
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/${this.embeddingModel}:embedContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.embeddingModel,
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
      console.error('Gemini Embedding Error:', error);
      // Return a mock embedding for development
      return this.generateMockEmbedding(text);
    }
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

// Mock Gemini Service (for development/testing)
export class MockGeminiService implements GeminiService {
  async analyzeProject(description: string, contacts: Contact[]): Promise<{
    requirements: TeamRequirement;
    reasoning: string;
    suggestedTeamSize: number;
  }> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const teamSize = this.extractTeamSize(description);
    const domain = this.extractDomain(description);
    const urgency = this.extractUrgency(description);
    const budget = this.extractBudget(description);
    const location = this.extractLocation(description);
    
    const roles = await this.extractRolesFromProject(description);
    const skills = this.extractSkills(description);
    
    const requirements: TeamRequirement = {
      description,
      teamSize,
      extractedRoles: roles,
      extractedSkills: skills,
      domain,
      urgency,
      budget,
      location
    };
    
    const reasoning = this.generateReasoning(description, domain, teamSize, roles);
    
    return {
      requirements,
      reasoning,
      suggestedTeamSize: teamSize
    };
  }
  
  async generateTeamRecommendations(
    requirements: TeamRequirement,
    scoredCandidates: any[]
  ): Promise<TeamRecommendation[]> {
    // This would be enhanced with AI-generated reasoning
    return [];
  }
  
  async extractRolesFromProject(description: string): Promise<string[]> {
    const roles: string[] = [];
    const desc = description.toLowerCase();
    
    // AI-like intelligent role extraction
    if (desc.includes("web") || desc.includes("site")) {
      roles.push("Frontend Developer", "Backend Developer");
    }
    
    if (desc.includes("mobil") || desc.includes("app")) {
      roles.push("Mobile Developer", "Backend Developer");
    }
    
    if (desc.includes("e-ticaret") || desc.includes("satış")) {
      roles.push("Frontend Developer", "Backend Developer", "UI/UX Designer");
    }
    
    if (desc.includes("pazarlama") || desc.includes("marketing")) {
      roles.push("Digital Marketing Specialist", "Content Creator");
    }
    
    if (desc.includes("finans") || desc.includes("muhasebe")) {
      roles.push("Financial Analyst", "Business Analyst");
    }
    
    // Always add project manager for teams > 2
    const teamSize = this.extractTeamSize(description);
    if (teamSize > 2) {
      roles.push("Project Manager");
    }
    
    return [...new Set(roles)];
  }
  
  async suggestTeamSize(description: string): Promise<number> {
    const desc = description.toLowerCase();
    
    // AI-like team size suggestion based on project complexity
    if (desc.includes("küçük") || desc.includes("basit") || desc.includes("minimal")) {
      return 2;
    }
    
    if (desc.includes("orta") || desc.includes("standart")) {
      return 3;
    }
    
    if (desc.includes("büyük") || desc.includes("karmaşık") || desc.includes("kapsamlı")) {
      return 5;
    }
    
    if (desc.includes("çok büyük") || desc.includes("enterprise")) {
      return 7;
    }
    
    return 3; // Default
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    return this.generateMockEmbedding(text);
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
  
  private extractTeamSize(description: string): number {
    const match = description.match(/(\d+)\s*(kişi|kişilik|üye|member|person)/);
    return match ? parseInt(match[1]) : 3;
  }
  
  private extractDomain(description: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes("yazılım") || desc.includes("web") || desc.includes("mobil")) return "teknoloji";
    if (desc.includes("pazarlama") || desc.includes("reklam")) return "pazarlama";
    if (desc.includes("finans") || desc.includes("muhasebe")) return "finans";
    if (desc.includes("e-ticaret") || desc.includes("satış")) return "e-ticaret";
    
    return "genel";
  }
  
  private extractUrgency(description: string): "low" | "medium" | "high" {
    const desc = description.toLowerCase();
    
    if (desc.includes("acil") || desc.includes("hızlı")) return "high";
    if (desc.includes("zaman") || desc.includes("süre")) return "medium";
    return "low";
  }
  
  private extractBudget(description: string): "low" | "medium" | "high" {
    const desc = description.toLowerCase();
    
    if (desc.includes("ucuz") || desc.includes("ekonomik")) return "low";
    if (desc.includes("premium") || desc.includes("yüksek")) return "high";
    return "medium";
  }
  
  private extractLocation(description: string): "local" | "remote" | "hybrid" {
    const desc = description.toLowerCase();
    
    if (desc.includes("uzaktan") || desc.includes("remote")) return "remote";
    if (desc.includes("yerel") || desc.includes("local")) return "local";
    return "hybrid";
  }
  
  private extractSkills(description: string): string[] {
    const skills: string[] = [];
    const desc = description.toLowerCase();
    
    if (desc.includes("web")) skills.push("web");
    if (desc.includes("mobil")) skills.push("mobil");
    if (desc.includes("tasarım")) skills.push("tasarım");
    if (desc.includes("pazarlama")) skills.push("pazarlama");
    if (desc.includes("veri")) skills.push("veri");
    
    return skills;
  }
  
  private generateReasoning(description: string, domain: string, teamSize: number, roles: string[]): string {
    return `Projenizi analiz ettim. ${domain} alanında ${teamSize} kişilik bir ekip için ${roles.join(", ")} rollerini öneriyorum. Bu ekip projenizin gereksinimlerini karşılayacak ve başarılı bir şekilde tamamlayacaktır.`;
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
export function createGeminiService(): GeminiService {
  // Support both Vite environment variables and Node.js process.env
  const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  if (apiKey) {
    return new GeminiServiceImpl(apiKey);
  } else {
    console.warn('No Gemini API key found, using mock service');
    return new MockGeminiService();
  }
}
