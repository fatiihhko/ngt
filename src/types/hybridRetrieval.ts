export interface ScoringWeights {
  semantic: number;
  keyword: number;
  proximity: number;
  domain: number;
  budgetPenalty: number;
}

export interface ScoringThresholds {
  minSemanticScore: number;
  minKeywordScore: number;
  minProximityScore: number;
}

export interface ScoringPenalties {
  budgetMismatch: number;
  locationMismatch: number;
  availabilityMismatch: number;
  languageMismatch: number;
}

export interface ScoringBoosts {
  exactRoleMatch: number;
  exactSkillMatch: number;
  highRelationshipDegree: number;
  domainExpertise: number;
}

export interface ScoringConfig {
  weights: ScoringWeights;
  thresholds: ScoringThresholds;
  penalties: ScoringPenalties;
  boosts: ScoringBoosts;
}

export interface PersonEmbedding {
  id: string;
  embedding: number[];
  text: string;
  skills: string[];
  services: string[];
  expertise: string[];
  tags: string[];
  languages: string[];
  locations: string[];
  roles: string[];
  domain: string;
}

export interface QueryEmbedding {
  embedding: number[];
  text: string;
  requirements: {
    roles: string[];
    skills: string[];
    domain: string;
    budget: "low" | "medium" | "high";
    location: "local" | "remote" | "hybrid";
    urgency: "low" | "medium" | "high";
  };
}

export interface RetrievalScore {
  personId: string;
  totalScore: number;
  subScores: {
    semantic: number;
    keyword: number;
    proximity: number;
    domain: number;
    budgetPenalty: number;
  };
  evidence: {
    matchedRoles: string[];
    matchedSkills: string[];
    matchedExpertise: string[];
    matchedServices: string[];
    relationshipDegree: number;
    availabilityScore: number;
    locationScore: number;
  };
  penalties: {
    budgetMismatch: boolean;
    locationMismatch: boolean;
    availabilityMismatch: boolean;
    languageMismatch: boolean;
  };
  boosts: {
    exactRoleMatch: boolean;
    exactSkillMatch: boolean;
    highRelationshipDegree: boolean;
    domainExpertise: boolean;
  };
}

export interface HybridRetrievalResult {
  recommendations: RetrievalScore[];
  query: QueryEmbedding;
  config: ScoringConfig;
  metadata: {
    totalPeople: number;
    filteredPeople: number;
    retrievalTime: number;
    semanticSearchUsed: boolean;
  };
}
