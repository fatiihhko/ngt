import type { Contact } from "@/components/network/types";
import type { TeamRequirement, TeamRecommendation } from "@/utils/ragSystem";

// AI Service Interface
export interface AIService {
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
}

// Mock AI Service (for development/testing)
export class MockAIService implements AIService {
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
}

// OpenAI Service (for production)
export class OpenAIService implements AIService {
  private apiKey: string;
  private baseURL: string;
  
  constructor(apiKey: string, baseURL: string = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
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
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);
      
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
      console.error('OpenAI API Error:', error);
      // Fallback to mock service
      const mockService = new MockAIService();
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
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      return content.split(',').map((role: string) => role.trim());
    } catch (error) {
      console.error('OpenAI API Error:', error);
      const mockService = new MockAIService();
      return mockService.extractRolesFromProject(description);
    }
  }
  
  async suggestTeamSize(description: string): Promise<number> {
    const prompt = `
    Proje açıklaması: "${description}"
    
    Bu proje için uygun ekip büyüklüğü kaç kişi olmalı? Sadece sayıyı yanıtla:
    `;
    
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      return parseInt(content) || 3;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      const mockService = new MockAIService();
      return mockService.suggestTeamSize(description);
    }
  }
}

// Service factory
export function createAIService(): AIService {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (apiKey) {
    return new OpenAIService(apiKey);
  } else {
    return new MockAIService();
  }
}
