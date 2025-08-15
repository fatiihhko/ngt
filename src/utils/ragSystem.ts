import type { Contact } from "@/components/network/types";

// Domain-independent skill and role mapping with semantic variations
const SKILL_ROLE_MAPPING = {
  // Technical Skills
  "yazılım": ["Software Developer", "Programmer", "Engineer", "Full Stack Developer"],
  "programlama": ["Software Developer", "Programmer", "Code Developer"],
  "kod": ["Software Developer", "Programmer", "Code Developer"],
  "web": ["Web Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer"],
  "mobil": ["Mobile Developer", "iOS Developer", "Android Developer", "App Developer"],
  "frontend": ["Frontend Developer", "UI Developer", "React Developer", "Vue Developer"],
  "backend": ["Backend Developer", "API Developer", "Server Developer", "Node.js Developer"],
  "fullstack": ["Full Stack Developer", "Software Engineer"],
  "database": ["Database Administrator", "Data Engineer", "SQL Developer"],
  "veri": ["Data Scientist", "Data Analyst", "Data Engineer", "Business Intelligence Developer"],
  "ai": ["AI Engineer", "Machine Learning Engineer", "Data Scientist", "ML Engineer"],
  "machine learning": ["Machine Learning Engineer", "Data Scientist", "AI Engineer"],
  "devops": ["DevOps Engineer", "Site Reliability Engineer", "Infrastructure Engineer"],
  "cloud": ["Cloud Engineer", "DevOps Engineer", "AWS Engineer", "Azure Engineer"],
  "güvenlik": ["Security Engineer", "Cybersecurity Specialist", "Information Security Analyst"],
  "react": ["React Developer", "Frontend Developer", "JavaScript Developer"],
  "node": ["Node.js Developer", "Backend Developer", "JavaScript Developer"],
  "python": ["Python Developer", "Backend Developer", "Data Scientist"],
  "java": ["Java Developer", "Backend Developer", "Software Engineer"],
  "sql": ["Database Administrator", "Data Analyst", "SQL Developer"],
  "docker": ["DevOps Engineer", "Infrastructure Engineer", "Cloud Engineer"],
  "kubernetes": ["DevOps Engineer", "Infrastructure Engineer", "Cloud Engineer"],
  "aws": ["Cloud Engineer", "DevOps Engineer", "AWS Engineer"],
  "azure": ["Cloud Engineer", "DevOps Engineer", "Azure Engineer"],
  
  // Design Skills
  "tasarım": ["UI/UX Designer", "Graphic Designer", "Product Designer"],
  "ui": ["UI Designer", "UX Designer"],
  "ux": ["UX Designer", "Product Designer"],
  "grafik": ["Graphic Designer", "Visual Designer"],
  "görsel": ["Visual Designer", "Graphic Designer"],
  "logo": ["Graphic Designer", "Brand Designer"],
  "marka": ["Brand Designer", "Marketing Designer"],
  
  // Business Skills
  "pazarlama": ["Marketing Specialist", "Digital Marketing Manager"],
  "satış": ["Sales Manager", "Business Development"],
  "iş geliştirme": ["Business Development Manager"],
  "strateji": ["Strategy Consultant", "Business Analyst"],
  "analiz": ["Business Analyst", "Data Analyst"],
  "finans": ["Financial Analyst", "Accountant"],
  "muhasebe": ["Accountant", "Financial Controller"],
  "hukuk": ["Legal Advisor", "Lawyer"],
  "insan kaynakları": ["HR Manager", "Recruiter"],
  "yönetim": ["Project Manager", "Product Manager"],
  "proje": ["Project Manager", "Program Manager"],
  "ürün": ["Product Manager", "Product Owner"],
  
  // Creative Skills
  "içerik": ["Content Creator", "Content Writer"],
  "yazı": ["Content Writer", "Copywriter"],
  "video": ["Video Editor", "Content Creator"],
  "fotoğraf": ["Photographer", "Visual Content Creator"],
  "sosyal medya": ["Social Media Manager", "Digital Marketing Specialist"],
  
  // Communication Skills
  "iletişim": ["Communication Specialist", "PR Manager"],
  "halkla ilişkiler": ["PR Manager", "Communication Specialist"],
  "müşteri": ["Customer Success Manager", "Account Manager"],
  
  // Research Skills
  "araştırma": ["Research Analyst", "Market Researcher"],
  "pazar": ["Market Researcher", "Business Analyst"],
  
  // Operations Skills
  "operasyon": ["Operations Manager", "Process Manager"],
  "süreç": ["Process Manager", "Operations Analyst"],
  "kalite": ["Quality Assurance", "Process Manager"],
  "tedarik": ["Supply Chain Manager", "Procurement Specialist"],
  
  // Education Skills
  "eğitim": ["Training Specialist", "Educational Content Creator"],
  "öğretim": ["Educational Content Creator", "Training Specialist"],
  
  // Health Skills
  "sağlık": ["Healthcare Specialist", "Medical Advisor"],
  "tıp": ["Medical Advisor", "Healthcare Consultant"],
  
  // Language Skills
  "çeviri": ["Translator", "Localization Specialist"],
  "dil": ["Language Specialist", "Translator"],
  
  // Generic Skills
  "liderlik": ["Team Lead", "Manager", "Director"],
  "koordinasyon": ["Coordinator", "Project Manager"],
  "planlama": ["Planner", "Strategy Consultant"],
  "organizasyon": ["Organizer", "Event Manager"],
  "etkinlik": ["Event Manager", "Event Coordinator"],
  "logistics": ["Logistics Manager", "Operations Manager"],
  "lojistik": ["Logistics Manager", "Operations Manager"]
};

// Team recommendation strategies
export type TeamStrategy = 
  | "fast_start" 
  | "budget_friendly" 
  | "senior_leadership" 
  | "local_alignment"
  | "balanced";

export interface TeamRequirement {
  description: string;
  teamSize: number;
  extractedRoles: string[];
  extractedSkills: string[];
  domain: string;
  urgency: "low" | "medium" | "high";
  budget: "low" | "medium" | "high";
  location: "local" | "remote" | "hybrid";
}

export interface CandidateScore {
  contact: Contact;
  roleMatch: number;
  skillMatch: number;
  relationshipScore: number;
  availabilityScore: number;
  locationScore: number;
  totalScore: number;
  matchedRoles: string[];
  matchedSkills: string[];
}

export interface TeamRecommendation {
  strategy: TeamStrategy;
  members: CandidateScore[];
  reasoning: string;
  estimatedCost: string;
  timeline: string;
  riskLevel: "low" | "medium" | "high";
  teamComposition: {
    roles: string[];
    skills: string[];
    averageRelationshipScore: number;
    averageAvailabilityScore: number;
    diversityScore: number;
    coverageScore: number;
  };
}

// Extract roles and skills from user description with intelligent project analysis
export function extractRequirements(userDescription: string): TeamRequirement {
  const description = userDescription.toLowerCase();
  
  // Extract team size
  const teamSizeMatch = description.match(/(\d+)\s*(kişi|kişilik|üye|member|person)/);
  const teamSize = teamSizeMatch ? parseInt(teamSizeMatch[1]) : 3;
  
  // Extract urgency
  const urgency = description.includes("acil") || description.includes("hızlı") || description.includes("urgent") 
    ? "high" 
    : description.includes("zaman") || description.includes("time") 
    ? "medium" 
    : "low";
  
  // Extract budget
  const budget = description.includes("ucuz") || description.includes("ekonomik") || description.includes("low budget")
    ? "low"
    : description.includes("premium") || description.includes("yüksek") || description.includes("high budget")
    ? "high"
    : "medium";
  
  // Extract location preference
  const location = description.includes("uzaktan") || description.includes("remote")
    ? "remote"
    : description.includes("yerel") || description.includes("local")
    ? "local"
    : "hybrid";
  
  // Extract domain
  const domain = extractDomain(description);
  
  // Intelligent project analysis to extract required roles
  const extractedRoles = analyzeProjectRequirements(description, domain, teamSize);
  const extractedSkills = extractSkillsFromProject(description, domain);
  
  return {
    description: userDescription,
    teamSize,
    extractedRoles,
    extractedSkills,
    domain,
    urgency,
    budget,
    location
  };
}

// Extract domain from description with enhanced keyword matching
function extractDomain(description: string): string {
  const domains = {
    "teknoloji": [
      "yazılım", "programlama", "web", "mobil", "ai", "tech", "software", "app", "uygulama",
      "developer", "engineer", "frontend", "backend", "fullstack", "react", "node", "python",
      "java", "database", "api", "cloud", "devops", "cybersecurity", "blockchain", "iot"
    ],
    "finans": [
      "finans", "muhasebe", "borsa", "yatırım", "finance", "accounting", "banking", "investment",
      "fintech", "cryptocurrency", "bitcoin", "ethereum", "trading", "portfolio", "risk"
    ],
    "sağlık": [
      "sağlık", "tıp", "hastane", "health", "medical", "healthcare", "pharma", "biotech",
      "telemedicine", "diagnostic", "treatment", "patient", "clinical", "research"
    ],
    "eğitim": [
      "eğitim", "okul", "üniversite", "education", "training", "learning", "edtech",
      "online course", "tutorial", "workshop", "seminar", "academic", "curriculum"
    ],
    "pazarlama": [
      "pazarlama", "reklam", "marketing", "advertising", "brand", "campaign", "social media",
      "digital marketing", "seo", "content marketing", "influencer", "pr", "growth"
    ],
    "e-ticaret": [
      "e-ticaret", "online satış", "ecommerce", "retail", "shopping", "marketplace",
      "payment", "shipping", "inventory", "order", "customer", "sales", "store"
    ],
    "medya": [
      "medya", "içerik", "video", "content", "media", "entertainment", "streaming",
      "podcast", "broadcast", "journalism", "publishing", "social media", "influencer"
    ],
    "gayrimenkul": [
      "gayrimenkul", "emlak", "real estate", "property", "construction", "architecture",
      "interior design", "property management", "leasing", "mortgage", "investment"
    ],
    "lojistik": [
      "lojistik", "nakliye", "logistics", "transport", "shipping", "warehouse",
      "supply chain", "distribution", "freight", "delivery", "inventory", "fulfillment"
    ],
    "enerji": [
      "enerji", "elektrik", "energy", "power", "renewable", "solar", "wind", "battery",
      "sustainability", "green energy", "utilities", "infrastructure", "smart grid"
    ],
    "çevre": [
      "çevre", "sürdürülebilirlik", "environment", "sustainability", "green", "eco",
      "recycling", "waste management", "carbon", "climate", "conservation", "biodiversity"
    ],
    "hukuk": [
      "hukuk", "legal", "law", "attorney", "lawyer", "compliance", "regulatory",
      "contract", "intellectual property", "patent", "trademark", "litigation"
    ],
    "insan kaynakları": [
      "insan kaynakları", "hr", "human resources", "recruitment", "hiring", "talent",
      "employee", "workforce", "compensation", "benefits", "training", "development"
    ]
  };
  
  // Count matches for each domain
  const domainScores: Record<string, number> = {};
  
  for (const [domain, keywords] of Object.entries(domains)) {
    const matches = keywords.filter(keyword => description.includes(keyword)).length;
    if (matches > 0) {
      domainScores[domain] = matches;
    }
  }
  
  // Return the domain with the highest score
  if (Object.keys(domainScores).length > 0) {
    const bestDomain = Object.entries(domainScores)
      .sort(([,a], [,b]) => b - a)[0][0];
    return bestDomain;
  }
  
  return "genel";
}

// Score candidates based on requirements with enhanced semantic matching
export function scoreCandidates(
  contacts: Contact[], 
  requirements: TeamRequirement
): CandidateScore[] {
  return contacts.map(contact => {
    const contactData = [
      contact.first_name || "",
      contact.last_name || "",
      contact.profession || "",
      ...(contact.services || []),
      ...(contact.tags || []),
      contact.description || ""
    ].join(" ").toLowerCase();
    
    // Enhanced role matching with semantic variations
    let roleMatch = 0;
    const matchedRoles: string[] = [];
    requirements.extractedRoles.forEach(role => {
      const roleLower = role.toLowerCase();
      
      // Direct match
      if (contactData.includes(roleLower) || 
          contact.profession?.toLowerCase().includes(roleLower)) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Partial match (e.g., "Developer" matches "Frontend Developer")
      else if (roleLower.includes("developer") && contactData.includes("developer")) {
        roleMatch += 1;
        matchedRoles.push(role);
      }
      // Semantic variations
      else if (roleLower.includes("manager") && contactData.includes("manager")) {
        roleMatch += 1;
        matchedRoles.push(role);
      }
      else if (roleLower.includes("engineer") && contactData.includes("engineer")) {
        roleMatch += 1;
        matchedRoles.push(role);
      }
      else if (roleLower.includes("analyst") && contactData.includes("analyst")) {
        roleMatch += 1;
        matchedRoles.push(role);
      }
    });
    
    // Enhanced skill matching with semantic variations
    let skillMatch = 0;
    const matchedSkills: string[] = [];
    requirements.extractedSkills.forEach(skill => {
      if (contactData.includes(skill)) {
        skillMatch += 2;
        matchedSkills.push(skill);
      }
      // Semantic skill variations
      else if (skill === "yazılım" && (contactData.includes("developer") || contactData.includes("programmer"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "tasarım" && (contactData.includes("designer") || contactData.includes("ui") || contactData.includes("ux"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "pazarlama" && (contactData.includes("marketing") || contactData.includes("sales"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "veri" && (contactData.includes("data") || contactData.includes("analyst"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
    });
    
    // Relationship score (0-10 scale)
    const relationshipScore = contact.relationship_degree || 5;
    
    // Enhanced availability score
    let availabilityScore = 5; // Default
    const availabilityKeywords = {
      high: ["müsait", "available", "boş", "free", "açık", "open"],
      low: ["meşgul", "busy", "dolu", "full", "kapalı", "closed", "yoğun"]
    };
    
    if (availabilityKeywords.high.some(keyword => contactData.includes(keyword))) {
      availabilityScore = 8;
    } else if (availabilityKeywords.low.some(keyword => contactData.includes(keyword))) {
      availabilityScore = 3;
    }
    
    // Enhanced location score
    let locationScore = 5; // Default
    if (requirements.location === "local" && contact.city) {
      locationScore = 8; // Bonus for having location info
    } else if (requirements.location === "remote" && contactData.includes("remote")) {
      locationScore = 8; // Bonus for remote preference
    }
    
    // Domain alignment bonus
    let domainBonus = 0;
    if (requirements.domain === "teknoloji" && 
        (contactData.includes("developer") || contactData.includes("engineer") || contactData.includes("tech"))) {
      domainBonus = 1;
    } else if (requirements.domain === "pazarlama" && 
               (contactData.includes("marketing") || contactData.includes("sales") || contactData.includes("brand"))) {
      domainBonus = 1;
    } else if (requirements.domain === "finans" && 
               (contactData.includes("finance") || contactData.includes("accounting") || contactData.includes("financial"))) {
      domainBonus = 1;
    }
    
    // Calculate total score with domain bonus
    const totalScore = (
      roleMatch * 3 + 
      skillMatch * 2 + 
      relationshipScore * 0.5 + 
      availabilityScore * 0.3 + 
      locationScore * 0.2 +
      domainBonus
    );
    
    return {
      contact,
      roleMatch,
      skillMatch,
      relationshipScore,
      availabilityScore,
      locationScore,
      totalScore,
      matchedRoles,
      matchedSkills
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

// Generate team recommendations using different strategies with enhanced logic
export function generateTeamRecommendations(
  scoredCandidates: CandidateScore[],
  requirements: TeamRequirement
): TeamRecommendation[] {
  const recommendations: TeamRecommendation[] = [];
  
  // Fast Start Strategy - Prioritize availability and quick response
  const fastStartMembers = scoredCandidates
    .sort((a, b) => b.availabilityScore - a.availabilityScore)
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "fast_start",
    members: fastStartMembers,
    reasoning: "Hızlı başlangıç için yüksek müsaitlik puanına sahip kişiler seçildi. Bu ekip hızlıca projeye başlayabilir ve acil ihtiyaçları karşılayabilir.",
    estimatedCost: requirements.budget === "low" ? "Düşük" : "Orta",
    timeline: requirements.urgency === "high" ? "1 hafta" : "1-2 hafta",
    riskLevel: "low",
    teamComposition: analyzeTeamComposition(fastStartMembers, requirements)
  });
  

  
  // Senior Leadership Strategy - Focus on experience and leadership
  const seniorMembers = scoredCandidates
    .sort((a, b) => b.roleMatch - a.roleMatch)
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "senior_leadership",
    members: seniorMembers,
    reasoning: "Deneyimli ve liderlik pozisyonlarında çalışmış kişiler seçildi. Bu ekip projeyi profesyonel şekilde yönetebilir ve stratejik kararlar alabilir.",
    estimatedCost: "Yüksek",
    timeline: "3-4 hafta",
    riskLevel: "low",
    teamComposition: analyzeTeamComposition(seniorMembers, requirements)
  });
  
  // Local Alignment Strategy - Focus on geographical proximity
  const localMembers = scoredCandidates
    .sort((a, b) => b.locationScore - a.locationScore)
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "local_alignment",
    members: localMembers,
    reasoning: "Yerel olarak uyumlu kişiler seçildi. Bu ekip yüz yüze çalışma imkanına sahip ve yerel pazar bilgisine sahiptir.",
    estimatedCost: "Orta",
    timeline: "2-3 hafta",
    riskLevel: "medium",
    teamComposition: analyzeTeamComposition(localMembers, requirements)
  });
  
  // Balanced Strategy - Optimal mix of all factors
  const balancedMembers = scoredCandidates
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "balanced",
    members: balancedMembers,
    reasoning: "Tüm kriterleri dengeli şekilde karşılayan kişiler seçildi. Bu ekip en optimal performansı sağlayabilir ve uzun vadeli başarı için tasarlanmıştır.",
    estimatedCost: "Orta-Yüksek",
    timeline: "2-4 hafta",
    riskLevel: "low",
    teamComposition: analyzeTeamComposition(balancedMembers, requirements)
  });
  
  return recommendations;
}

// Intelligent project analysis to determine required roles based on project description
function analyzeProjectRequirements(description: string, domain: string, teamSize: number): string[] {
  const roles: string[] = [];
  
  // Project type analysis
  if (description.includes("web") || description.includes("site") || description.includes("website")) {
    roles.push("Frontend Developer", "Backend Developer");
  }
  
  if (description.includes("mobil") || description.includes("app") || description.includes("mobile")) {
    roles.push("Mobile Developer", "Backend Developer");
  }
  
  if (description.includes("e-ticaret") || description.includes("ecommerce") || description.includes("online satış") || description.includes("satış")) {
    roles.push("Frontend Developer", "Backend Developer", "UI/UX Designer", "Digital Marketing Specialist");
  }
  
  if (description.includes("ödeme") || description.includes("payment") || description.includes("finansal")) {
    roles.push("Backend Developer", "Financial Analyst", "Security Engineer");
  }
  
  if (description.includes("müşteri") || description.includes("customer") || description.includes("kullanıcı")) {
    roles.push("UI/UX Designer", "Customer Success Manager", "Business Analyst");
  }
  
  if (description.includes("pazarlama") || description.includes("marketing") || description.includes("reklam")) {
    roles.push("Digital Marketing Specialist", "Content Creator", "Social Media Manager");
  }
  
  if (description.includes("finans") || description.includes("finance") || description.includes("muhasebe")) {
    roles.push("Financial Analyst", "Accountant", "Business Analyst");
  }
  
  if (description.includes("sağlık") || description.includes("health") || description.includes("tıp")) {
    roles.push("Healthcare Specialist", "Medical Advisor", "Data Analyst");
  }
  
  if (description.includes("eğitim") || description.includes("education") || description.includes("training")) {
    roles.push("Educational Content Creator", "Training Specialist", "Instructional Designer");
  }
  
  if (description.includes("medya") || description.includes("content") || description.includes("video")) {
    roles.push("Content Creator", "Video Editor", "Social Media Manager");
  }
  
  if (description.includes("gayrimenkul") || description.includes("real estate") || description.includes("emlak")) {
    roles.push("Real Estate Specialist", "Property Manager", "Marketing Specialist");
  }
  
  if (description.includes("lojistik") || description.includes("logistics") || description.includes("nakliye")) {
    roles.push("Logistics Manager", "Operations Manager", "Supply Chain Specialist");
  }
  
  // Always add a project manager for teams larger than 2
  if (teamSize > 2) {
    roles.push("Project Manager");
  }
  
  // Add domain-specific roles
  if (domain === "teknoloji") {
    if (!roles.includes("Software Developer")) roles.push("Software Developer");
    if (!roles.includes("UI/UX Designer")) roles.push("UI/UX Designer");
  }
  
  if (domain === "pazarlama") {
    if (!roles.includes("Marketing Specialist")) roles.push("Marketing Specialist");
    if (!roles.includes("Content Creator")) roles.push("Content Creator");
  }
  
  if (domain === "finans") {
    if (!roles.includes("Financial Analyst")) roles.push("Financial Analyst");
    if (!roles.includes("Business Analyst")) roles.push("Business Analyst");
  }
  
  // Ensure we have enough roles for the team size
  while (roles.length < teamSize) {
    if (domain === "teknoloji") {
      roles.push("Software Developer");
    } else if (domain === "pazarlama") {
      roles.push("Marketing Specialist");
    } else if (domain === "finans") {
      roles.push("Business Analyst");
    } else {
      roles.push("Generalist");
    }
  }
  
  // Remove duplicates and limit to team size
  return [...new Set(roles)].slice(0, teamSize);
}

// Extract skills from project description
function extractSkillsFromProject(description: string, domain: string): string[] {
  const skills: string[] = [];
  
  // Extract skills from SKILL_ROLE_MAPPING
  Object.entries(SKILL_ROLE_MAPPING).forEach(([skill, roles]) => {
    if (description.includes(skill)) {
      skills.push(skill);
    }
  });
  
  // Add domain-specific skills
  if (domain === "teknoloji") {
    if (description.includes("web") || description.includes("site")) skills.push("web");
    if (description.includes("mobil") || description.includes("app")) skills.push("mobil");
    if (description.includes("tasarım") || description.includes("design")) skills.push("tasarım");
    if (description.includes("veri") || description.includes("data")) skills.push("veri");
  }
  
  if (domain === "pazarlama") {
    if (description.includes("sosyal") || description.includes("social")) skills.push("sosyal medya");
    if (description.includes("içerik") || description.includes("content")) skills.push("içerik");
    if (description.includes("reklam") || description.includes("advertising")) skills.push("pazarlama");
  }
  
  if (domain === "finans") {
    if (description.includes("analiz") || description.includes("analysis")) skills.push("analiz");
    if (description.includes("bütçe") || description.includes("budget")) skills.push("finans");
  }
  
  return [...new Set(skills)];
}

// Analyze team composition and calculate various metrics
function analyzeTeamComposition(
  members: CandidateScore[], 
  requirements: TeamRequirement
) {
  if (members.length === 0) {
    return {
      roles: [],
      skills: [],
      averageRelationshipScore: 0,
      averageAvailabilityScore: 0,
      diversityScore: 0,
      coverageScore: 0
    };
  }

  // Collect all unique roles and skills
  const allRoles = new Set<string>();
  const allSkills = new Set<string>();
  
  members.forEach(member => {
    member.matchedRoles.forEach(role => allRoles.add(role));
    member.matchedSkills.forEach(skill => allSkills.add(skill));
  });

  // Calculate averages
  const averageRelationshipScore = members.reduce((sum, m) => sum + m.relationshipScore, 0) / members.length;
  const averageAvailabilityScore = members.reduce((sum, m) => sum + m.availabilityScore, 0) / members.length;

  // Calculate diversity score (how many different roles/skills are covered)
  const diversityScore = Math.min(10, (allRoles.size + allSkills.size) / 2);

  // Calculate coverage score (how well the team covers required roles)
  const requiredRoles = requirements.extractedRoles.length;
  const coveredRoles = allRoles.size;
  const coverageScore = requiredRoles > 0 ? Math.min(10, (coveredRoles / requiredRoles) * 10) : 10;

  return {
    roles: Array.from(allRoles),
    skills: Array.from(allSkills),
    averageRelationshipScore: Math.round(averageRelationshipScore * 10) / 10,
    averageAvailabilityScore: Math.round(averageAvailabilityScore * 10) / 10,
    diversityScore: Math.round(diversityScore * 10) / 10,
    coverageScore: Math.round(coverageScore * 10) / 10
  };
}
