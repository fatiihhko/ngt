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
        minSemanticScore: 0.3,
        minKeywordScore: 0.1,
        minProximityScore: 0.2
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
    
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const personEmbedding = personEmbeddings[i];
      
      const semanticScore = await this.calculateSemanticScore(queryEmbedding, personEmbedding);
      const keywordScore = this.calculateKeywordScore(queryEmbedding, personEmbedding);
      const proximityScore = this.calculateProximityScore(contact, requirements);
      const domainScore = this.calculateDomainScore(personEmbedding.domain, queryEmbedding.requirements.domain);
      const budgetPenalty = this.calculateBudgetPenalty(contact, requirements);
      
      // Apply thresholds
      if (semanticScore < finalConfig.thresholds.minSemanticScore) continue;
      if (keywordScore < finalConfig.thresholds.minKeywordScore) continue;
      if (proximityScore < finalConfig.thresholds.minProximityScore) continue;
      
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
    
    // Role matching
    const roleMatches = query.requirements.roles.filter(role =>
      person.roles.some(personRole => 
        personRole.toLowerCase().includes(role.toLowerCase()) ||
        role.toLowerCase().includes(personRole.toLowerCase())
      )
    );
    score += roleMatches.length * 0.3;
    totalMatches += roleMatches.length;
    
    // Skill matching
    const skillMatches = query.requirements.skills.filter(skill =>
      person.skills.some(personSkill => 
        personSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(personSkill.toLowerCase())
      )
    );
    score += skillMatches.length * 0.2;
    totalMatches += skillMatches.length;
    
    // Tag matching
    const tagMatches = query.requirements.skills.filter(skill =>
      person.tags.some(tag => 
        tag.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(tag.toLowerCase())
      )
    );
    score += tagMatches.length * 0.1;
    totalMatches += tagMatches.length;
    
    // Text matching
    const queryText = query.text.toLowerCase();
    const personText = person.text.toLowerCase();
    
    const textMatches = query.requirements.skills.filter(skill =>
      personText.includes(skill.toLowerCase())
    );
    score += textMatches.length * 0.1;
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
    const matchedRoles = queryEmbedding.requirements.roles.filter(role =>
      personEmbedding.roles.some(personRole => 
        personRole.toLowerCase().includes(role.toLowerCase())
      )
    );
    
    const matchedSkills = queryEmbedding.requirements.skills.filter(skill =>
      personEmbedding.skills.some(personSkill => 
        personSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return {
      matchedRoles,
      matchedSkills,
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
    const text = [
      contact.first_name || "",
      contact.last_name || "",
      contact.profession || "",
      contact.description || "",
      ...(contact.services || []),
      ...(contact.tags || [])
    ].join(" ").toLowerCase();
    
    if (text.includes("müsait") || text.includes("available")) return 0.8;
    if (text.includes("meşgul") || text.includes("busy")) return 0.3;
    return 0.5; // Default
  }
  
  private calculateLocationScore(contact: Contact, requirements: any): number {
    if (requirements.location === "hybrid") return 1.0;
    if (requirements.location === "remote") return 1.0;
    if (requirements.location === "local" && contact.city) return 0.8;
    if (requirements.location === "local" && !contact.city) return 0.2;
    return 0.5;
  }
}

// Service factory
export function createHybridRetrievalService(): HybridRetrievalService {
  return new HybridRetrievalServiceImpl();
}
