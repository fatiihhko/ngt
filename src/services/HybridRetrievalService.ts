import type { 
  HybridRetrievalResult, 
  RetrievalScore, 
  ScoringConfig,
  PersonEmbedding,
  QueryEmbedding
} from "@/types/hybridRetrieval";
import { createEmbeddingService } from "./EmbeddingService";
import type { Contact } from "@/components/network/types";
import { supabase } from "@/integrations/supabase/client";

export interface HybridRetrievalService {
  search(
    query: string,
    requirements: any,
    contacts: Contact[],
    config?: Partial<ScoringConfig>
  ): Promise<HybridRetrievalResult>;
  
  calculateSemanticScore(
    queryEmbedding: QueryEmbedding,
    personEmbedding: PersonEmbedding
  ): Promise<number>;
  
  calculateKeywordScore(
    query: QueryEmbedding,
    person: PersonEmbedding
  ): number;
  
  calculateProximityScore(
    person: Contact,
    requirements: any
  ): number;
  
  calculateDomainScore(
    personDomain: string,
    queryDomain: string
  ): number;
  
  calculateBudgetPenalty(
    person: Contact,
    requirements: any
  ): number;
}

export class HybridRetrievalServiceImpl implements HybridRetrievalService {
  private embeddingService = createEmbeddingService();
  private defaultConfig: ScoringConfig;
  
  constructor() {
    this.defaultConfig = {
      weights: {
        semantic: 0.45,
        keyword: 0.20,
        proximity: 0.20,
        domain: 0.10,
        budgetPenalty: -0.05
      },
      thresholds: {
        minSemanticScore: 0.01, // Çok düşük - tüm kişiler geçebilsin
        minKeywordScore: 0.001, // Çok düşük - tüm kişiler geçebilsin
        minProximityScore: 0.01 // Çok düşük - tüm kişiler geçebilsin
      },
      penalties: {
        budgetMismatch: 0.2,
        locationMismatch: 0.15,
        availabilityMismatch: 0.1,
        languageMismatch: 0.1
      },
      boosts: {
        exactRoleMatch: 0.3,
        exactSkillMatch: 0.2,
        highRelationshipDegree: 0.15,
        domainExpertise: 0.1
      }
    };
  }
  
  async search(
    query: string,
    requirements: any,
    contacts: Contact[],
    config: Partial<ScoringConfig> = {}
  ): Promise<HybridRetrievalResult> {
    const startTime = Date.now();
    const finalConfig = { ...this.defaultConfig, ...config };
    
    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query, requirements);
    
    // Generate person embeddings (temporarily using mock data)
    const personEmbeddings = await Promise.all(
      contacts.map(contact => this.embeddingService.generatePersonEmbedding(contact))
    );
    
    // Calculate scores for each person
    const scores: RetrievalScore[] = [];
    
    console.log('🔍 Debug: Starting search with', contacts.length, 'contacts');
    console.log('🔍 Debug: Query requirements:', requirements);
    console.log('🔍 Debug: Query requirements skills:', requirements.skills);
    console.log('🔍 Debug: Query requirements roles:', requirements.roles);
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const personEmbedding = personEmbeddings[i];
      
      console.log(`🔍 Debug: Processing ${contact.first_name} ${contact.last_name}`);
      console.log(`🔍 Debug: Contact services:`, contact.services);
      console.log(`🔍 Debug: Contact expertise:`, contact.expertise);
      console.log(`🔍 Debug: Person embedding services:`, personEmbedding.services);
      console.log(`🔍 Debug: Person embedding expertise:`, personEmbedding.expertise);
      
      const semanticScore = await this.calculateSemanticScore(queryEmbedding, personEmbedding);
      const keywordScore = this.calculateKeywordScore(queryEmbedding, personEmbedding);
      const proximityScore = this.calculateProximityScore(contact, requirements);
      const domainScore = this.calculateDomainScore(personEmbedding.domain, queryEmbedding.requirements.domain);
      const budgetPenalty = this.calculateBudgetPenalty(contact, requirements);
      
      console.log(`🔍 Debug: ${contact.first_name} scores:`, {
        semantic: semanticScore.toFixed(3),
        keyword: keywordScore.toFixed(3),
        proximity: proximityScore.toFixed(3),
        domain: domainScore.toFixed(3)
      });
      
      // Apply thresholds
      if (semanticScore < finalConfig.thresholds.minSemanticScore) {
        console.log(`❌ ${contact.first_name} failed semantic threshold: ${semanticScore.toFixed(3)} < ${finalConfig.thresholds.minSemanticScore}`);
        continue;
      }
      if (keywordScore < finalConfig.thresholds.minKeywordScore) {
        console.log(`❌ ${contact.first_name} failed keyword threshold: ${keywordScore.toFixed(3)} < ${finalConfig.thresholds.minKeywordScore}`);
        continue;
      }
      if (proximityScore < finalConfig.thresholds.minProximityScore) {
        console.log(`❌ ${contact.first_name} failed proximity threshold: ${proximityScore.toFixed(3)} < ${finalConfig.thresholds.minProximityScore}`);
        continue;
      }
      
      console.log(`✅ ${contact.first_name} passed all thresholds!`);
      
      // Calculate total score
      const totalScore = 
        finalConfig.weights.semantic * semanticScore +
        finalConfig.weights.keyword * keywordScore +
        finalConfig.weights.proximity * proximityScore +
        finalConfig.weights.domain * domainScore +
        finalConfig.weights.budgetPenalty * budgetPenalty;
      
      // Calculate evidence
      const evidence = this.calculateEvidence(contact, personEmbedding, queryEmbedding);
      const penalties = this.calculatePenalties(contact, requirements, finalConfig);
      const boosts = this.calculateBoosts(contact, personEmbedding, queryEmbedding, finalConfig);
      
      scores.push({
        personId: contact.id,
        totalScore,
        subScores: {
          semantic: semanticScore,
          keyword: keywordScore,
          proximity: proximityScore,
          domain: domainScore,
          budgetPenalty
        },
        evidence,
        penalties,
        boosts
      });
    }
    
    // Sort by total score
    scores.sort((a, b) => b.totalScore - a.totalScore);
    
    const retrievalTime = Date.now() - startTime;
    
    return {
      recommendations: scores,
      query: queryEmbedding,
      config: finalConfig,
      metadata: {
        totalPeople: contacts.length,
        filteredPeople: scores.length,
        retrievalTime,
        semanticSearchUsed: true
      }
    };
  }
  
  async calculateSemanticScore(
    queryEmbedding: QueryEmbedding,
    personEmbedding: PersonEmbedding
  ): Promise<number> {
    return await this.embeddingService.calculateCosineSimilarity(
      queryEmbedding.embedding,
      personEmbedding.embedding
    );
  }
  
  calculateKeywordScore(query: QueryEmbedding, person: PersonEmbedding): number {
    let score = 0;
    let totalMatches = 0;
    
    console.log('🔍 Debug: calculateKeywordScore called');
    console.log('🔍 Debug: Query requirements skills:', query.requirements.skills);
    console.log('🔍 Debug: Person services:', person.services);
    console.log('🔍 Debug: Person expertise:', person.expertise);
    
    // Enhanced role matching with semantic understanding
    const roleMatches = [];
    
    query.requirements.roles.forEach(role => {
      const roleLower = role.toLowerCase();
      let matched = false;
      
      person.roles.forEach(personRole => {
        const personRoleLower = personRole.toLowerCase();
        
        // Direct match
        if (personRoleLower.includes(roleLower) || roleLower.includes(personRoleLower)) {
          matched = true;
        }
        // Semantic software development matching
        else if (
          (roleLower.includes("frontend developer") || roleLower.includes("backend developer") || 
           roleLower.includes("software developer") || roleLower.includes("full stack developer")) &&
          (personRoleLower.includes("yazılım mühendisi") || personRoleLower.includes("software engineer") ||
           personRoleLower.includes("yazılım geliştirici") || personRoleLower.includes("developer") ||
           personRoleLower.includes("mühendis"))
        ) {
          matched = true;
        }
        // Marketing roles matching
        else if (
          roleLower.includes("marketing") &&
          (personRoleLower.includes("pazarlama") || personRoleLower.includes("marketing"))
        ) {
          matched = true;
        }
        // Management roles matching
        else if (
          roleLower.includes("manager") &&
          (personRoleLower.includes("müdür") || personRoleLower.includes("manager") || 
           personRoleLower.includes("yönetici"))
        ) {
          matched = true;
        }
      });
      
      if (matched) {
        roleMatches.push(role);
      }
    });
    
    console.log('🔍 Debug: Role matches:', roleMatches);
    score += roleMatches.length * 0.2; // Reduced from 0.3
    totalMatches += roleMatches.length;
    
    // Expertise matching (HIGHEST weight for "Uzmanlık")
    const expertiseMatches = query.requirements.skills.filter(skill =>
      person.expertise.some(expertise => 
        expertise.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(expertise.toLowerCase())
      )
    );
    console.log('🔍 Debug: Expertise matches:', expertiseMatches);
    score += expertiseMatches.length * 0.45; // HIGHEST weight for expertise
    totalMatches += expertiseMatches.length;
    
    // Services matching (VERY HIGH weight for "Hizmetler")
    console.log('🔍 Debug: Checking services matching...');
    console.log('🔍 Debug: Available services:', person.services);
    
    const serviceMatches = query.requirements.skills.filter(skill => {
      const skillLower = skill.toLowerCase();
      console.log(`🔍 Debug: Checking skill "${skill}" against services...`);
      
      const match = person.services.some(service => {
        const serviceLower = service.toLowerCase();
        
        // Enhanced matching logic
        let isMatch = serviceLower.includes(skillLower) || skillLower.includes(serviceLower);
        
        // Special case: if skill is a programming language/tech, check if service contains "yazılım"
        if (!isMatch && (
          skillLower.includes("javascript") || skillLower.includes("react") || 
          skillLower.includes("node") || skillLower.includes("python") || 
          skillLower.includes("sql") || skillLower.includes("java") ||
          skillLower.includes("developer") || skillLower.includes("programming")
        )) {
          isMatch = serviceLower.includes("yazılım") || serviceLower.includes("software") || 
                   serviceLower.includes("programlama") || serviceLower.includes("kod");
        }
        
        // Special case: if skill is "project management", check for management-related services
        if (!isMatch && skillLower.includes("project management")) {
          isMatch = serviceLower.includes("yönetim") || serviceLower.includes("management") ||
                   serviceLower.includes("ekip") || serviceLower.includes("team");
        }
        
        // Special case: marketing skills
        if (!isMatch && (
          skillLower.includes("marketing") || skillLower.includes("pazarlama") ||
          skillLower.includes("social media") || skillLower.includes("sosyal medya") ||
          skillLower.includes("advertising") || skillLower.includes("reklam")
        )) {
          isMatch = serviceLower.includes("pazarlama") || serviceLower.includes("marketing") ||
                   serviceLower.includes("reklam") || serviceLower.includes("sosyal medya");
        }
        
        // Special case: design skills
        if (!isMatch && (
          skillLower.includes("design") || skillLower.includes("tasarım") ||
          skillLower.includes("ui") || skillLower.includes("ux") ||
          skillLower.includes("graphic") || skillLower.includes("grafik")
        )) {
          isMatch = serviceLower.includes("tasarım") || serviceLower.includes("design") ||
                   serviceLower.includes("grafik") || serviceLower.includes("ui") ||
                   serviceLower.includes("ux");
        }
        
        // Special case: finance/accounting skills
        if (!isMatch && (
          skillLower.includes("finance") || skillLower.includes("finans") ||
          skillLower.includes("accounting") || skillLower.includes("muhasebe") ||
          skillLower.includes("tax") || skillLower.includes("vergi")
        )) {
          isMatch = serviceLower.includes("finans") || serviceLower.includes("finance") ||
                   serviceLower.includes("muhasebe") || serviceLower.includes("accounting") ||
                   serviceLower.includes("vergi") || serviceLower.includes("tax");
        }
        
        // Special case: legal skills
        if (!isMatch && (
          skillLower.includes("legal") || skillLower.includes("hukuk") ||
          skillLower.includes("law") || skillLower.includes("avukat") ||
          skillLower.includes("contract") || skillLower.includes("sözleşme")
        )) {
          isMatch = serviceLower.includes("hukuk") || serviceLower.includes("legal") ||
                   serviceLower.includes("avukat") || serviceLower.includes("law") ||
                   serviceLower.includes("sözleşme") || serviceLower.includes("contract");
        }
        
        // Special case: AI/ML skills
        if (!isMatch && (
          skillLower.includes("ai") || skillLower.includes("yapay zeka") ||
          skillLower.includes("machine learning") || skillLower.includes("ml") ||
          skillLower.includes("data science") || skillLower.includes("veri bilimi")
        )) {
          isMatch = serviceLower.includes("yapay zeka") || serviceLower.includes("ai") ||
                   serviceLower.includes("machine learning") || serviceLower.includes("ml") ||
                   serviceLower.includes("veri bilimi") || serviceLower.includes("data science");
        }
        
        console.log(`🔍 Debug: Service "${service}" vs skill "${skill}" = ${isMatch}`);
        return isMatch;
      });
      
      if (match) {
        console.log(`🔍 Debug: Found match for skill "${skill}"`);
      }
      return match;
    });
    
    console.log('🔍 Debug: Final service matches:', serviceMatches);
    score += serviceMatches.length * 0.35; // VERY HIGH weight for services
    totalMatches += serviceMatches.length;
    
    // Tag matching
    const tagMatches = query.requirements.skills.filter(skill =>
      person.tags.some(tag => 
        tag.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(tag.toLowerCase())
      )
    );
    score += tagMatches.length * 0.1;
    totalMatches += tagMatches.length;
    
    // Text matching (reduced weight)
    const queryText = query.text.toLowerCase();
    const personText = person.text.toLowerCase();
    
    const textMatches = query.requirements.skills.filter(skill =>
      personText.includes(skill.toLowerCase())
    );
    score += textMatches.length * 0.05; // Reduced from 0.1
    totalMatches += textMatches.length;
    
    return totalMatches > 0 ? score / totalMatches : 0;
  }
  
  calculateProximityScore(person: Contact, requirements: any): number {
    let score = 0;
    
    // Relationship degree (0-10 scale)
    const relationshipScore = (person.relationship_degree || 5) / 10;
    score += relationshipScore * 0.4;
    
    // Availability score
    const availabilityScore = this.calculateAvailabilityScore(person);
    score += availabilityScore * 0.3;
    
    // Location score
    const locationScore = this.calculateLocationScore(person, requirements);
    score += locationScore * 0.3;
    
    return score;
  }
  
  calculateDomainScore(personDomain: string, queryDomain: string): number {
    if (personDomain === queryDomain) return 1.0;
    if (personDomain === "genel" || queryDomain === "genel") return 0.5;
    return 0.0;
  }
  
  calculateBudgetPenalty(person: Contact, requirements: any): number {
    // This would be enhanced with actual budget information
    // For now, use relationship degree as a proxy for cost
    const relationshipDegree = person.relationship_degree || 5;
    
    if (requirements.budget === "low" && relationshipDegree < 7) {
      return 0.2; // Penalty for low budget requirement with high relationship
    }
    
    if (requirements.budget === "high" && relationshipDegree > 7) {
      return 0.1; // Small penalty for high budget requirement with low relationship
    }
    
    return 0;
  }
  
  private calculateEvidence(
    contact: Contact,
    personEmbedding: PersonEmbedding,
    queryEmbedding: QueryEmbedding
  ) {
    const matchedRoles = [];
    
    queryEmbedding.requirements.roles.forEach(role => {
      const roleLower = role.toLowerCase();
      let matched = false;
      
      personEmbedding.roles.forEach(personRole => {
        const personRoleLower = personRole.toLowerCase();
        
        // Direct match
        if (personRoleLower.includes(roleLower) || roleLower.includes(personRoleLower)) {
          matched = true;
        }
        // Semantic software development matching
        else if (
          (roleLower.includes("frontend developer") || roleLower.includes("backend developer") || 
           roleLower.includes("software developer") || roleLower.includes("full stack developer")) &&
          (personRoleLower.includes("yazılım mühendisi") || personRoleLower.includes("software engineer") ||
           personRoleLower.includes("yazılım geliştirici") || personRoleLower.includes("developer") ||
           personRoleLower.includes("mühendis"))
        ) {
          matched = true;
        }
        // Marketing roles matching
        else if (
          roleLower.includes("marketing") &&
          (personRoleLower.includes("pazarlama") || personRoleLower.includes("marketing"))
        ) {
          matched = true;
        }
        // Management roles matching
        else if (
          roleLower.includes("manager") &&
          (personRoleLower.includes("müdür") || personRoleLower.includes("manager") || 
           personRoleLower.includes("yönetici"))
        ) {
          matched = true;
        }
      });
      
      if (matched) {
        matchedRoles.push(role);
      }
    });
    
    const matchedSkills = queryEmbedding.requirements.skills.filter(skill =>
      personEmbedding.skills.some(personSkill => 
        personSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    // Add expertise matches (Uzmanlık)
    const matchedExpertise = queryEmbedding.requirements.skills.filter(skill =>
      personEmbedding.expertise.some(expertise => 
        expertise.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(expertise.toLowerCase())
      )
    );
    
    // Add services matches (Hizmetler)
    const matchedServices = queryEmbedding.requirements.skills.filter(skill =>
      personEmbedding.skills.some(service => 
        service.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(service.toLowerCase())
      )
    );
    
    return {
      matchedRoles,
      matchedSkills,
      matchedExpertise,
      matchedServices,
      relationshipDegree: contact.relationship_degree || 5,
      availabilityScore: this.calculateAvailabilityScore(contact),
      locationScore: this.calculateLocationScore(contact, queryEmbedding.requirements)
    };
  }
  
  private calculatePenalties(contact: Contact, requirements: any, config: ScoringConfig) {
    return {
      budgetMismatch: false, // Would be calculated based on actual budget data
      locationMismatch: requirements.location !== "hybrid" && 
                       requirements.location === "local" && !contact.city,
      availabilityMismatch: this.calculateAvailabilityScore(contact) < 0.5,
      languageMismatch: false // Would be calculated based on language requirements
    };
  }
  
  private calculateBoosts(
    contact: Contact,
    personEmbedding: PersonEmbedding,
    queryEmbedding: QueryEmbedding,
    config: ScoringConfig
  ) {
    const exactRoleMatch = queryEmbedding.requirements.roles.some(role =>
      personEmbedding.roles.some(personRole => 
        personRole.toLowerCase() === role.toLowerCase()
      )
    );
    
    const exactSkillMatch = queryEmbedding.requirements.skills.some(skill =>
      personEmbedding.skills.some(personSkill => 
        personSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    const highRelationshipDegree = (contact.relationship_degree || 5) >= 8;
    
    const domainExpertise = personEmbedding.domain === queryEmbedding.requirements.domain;
    
    return {
      exactRoleMatch,
      exactSkillMatch,
      highRelationshipDegree,
      domainExpertise
    };
  }
  
  private calculateAvailabilityScore(contact: Contact): number {
    // Enhanced availability calculation using comprehensive data
    const text = [
      contact.first_name || "",
      contact.last_name || "",
      contact.profession || "",
      contact.company || "",
      contact.work_experience || "",
      contact.future_goals || "",
      contact.business_ideas || "",
      contact.description || "",
      ...(contact.services || []),
      ...(contact.sectors || []),
      ...(contact.expertise || []),
      ...(contact.tags || [])
    ].join(" ").toLowerCase();
    
    // Check for availability keywords
    const availabilityKeywords = {
      high: ["müsait", "available", "boş", "free", "açık", "open", "hazır", "ready"],
      low: ["meşgul", "busy", "dolu", "full", "kapalı", "closed", "yoğun", "occupied"]
    };
    
    if (availabilityKeywords.high.some(keyword => text.includes(keyword))) {
      return 0.8;
    }
    
    if (availabilityKeywords.low.some(keyword => text.includes(keyword))) {
      return 0.3;
    }
    
    // Check if person is actively looking for opportunities
    if (contact.future_goals && contact.future_goals.toLowerCase().includes("yeni")) {
      return 0.7;
    }
    
    if (contact.business_ideas && contact.business_ideas.length > 0) {
      return 0.6; // Shows entrepreneurial spirit
    }
    
    return 0.5; // Default
  }
  
  private calculateLocationScore(contact: Contact, requirements: any): number {
    if (requirements.location === "hybrid") return 1.0;
    if (requirements.location === "remote") return 1.0;
    
    // Use current_city as primary location
    const primaryLocation = contact.current_city || contact.city;
    
    if (requirements.location === "local" && primaryLocation) {
      // Check if person has moved recently (shows flexibility)
      if (contact.turning_points && 
          (contact.turning_points.toLowerCase().includes("şehir") || 
           contact.turning_points.toLowerCase().includes("city"))) {
        return 0.9; // Bonus for flexibility
      }
      return 0.8;
    }
    
    if (requirements.location === "local" && !primaryLocation) return 0.2;
    return 0.5;
  }
}

// Service factory
export function createHybridRetrievalService(): HybridRetrievalService {
  return new HybridRetrievalServiceImpl();
}
