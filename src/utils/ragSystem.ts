import type { Contact } from "@/components/network/types";

// Domain-independent skill and role mapping with semantic variations
const SKILL_ROLE_MAPPING = {
  // ===== TEKNOLOJİ SEKTÖRÜ =====
  // Technical Skills
  "yazılım": ["Software Developer", "Programmer", "Engineer", "Full Stack Developer", "Software Engineer"],
  "yazılım mühendisi": ["Software Engineer", "Software Developer", "Programmer", "Engineer"],
  "yazılım geliştirici": ["Software Developer", "Software Engineer", "Programmer"],
  "mühendis": ["Engineer", "Software Engineer", "Developer"],
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
  "güvenlik": ["Security Engineer", "Cybersecurity Specialist", "Information Security Analyst", "Security Manager", "Security Specialist", "Security Officer"],
  "react": ["React Developer", "Frontend Developer", "JavaScript Developer"],
  "node": ["Node.js Developer", "Backend Developer", "JavaScript Developer"],
  "python": ["Python Developer", "Backend Developer", "Data Scientist"],
  "java": ["Java Developer", "Backend Developer", "Software Engineer"],
  "sql": ["Database Administrator", "Data Analyst", "SQL Developer"],
  "docker": ["DevOps Engineer", "Infrastructure Engineer", "Cloud Engineer"],
  "kubernetes": ["DevOps Engineer", "Infrastructure Engineer", "Cloud Engineer"],
  "aws": ["Cloud Engineer", "DevOps Engineer", "AWS Engineer"],
  "azure": ["Cloud Engineer", "DevOps Engineer", "Azure Engineer"],
  "blockchain": ["Blockchain Developer", "Smart Contract Developer", "Web3 Developer"],
  "iot": ["IoT Engineer", "Embedded Systems Engineer", "Hardware Engineer"],
  
  // Design Skills
  "tasarım": ["UI/UX Designer", "Graphic Designer", "Product Designer"],
  "ui": ["UI Designer", "UX Designer"],
  "ux": ["UX Designer", "Product Designer"],
  "grafik": ["Graphic Designer", "Visual Designer"],
  "görsel": ["Visual Designer", "Graphic Designer"],
  "logo": ["Graphic Designer", "Brand Designer"],
  "marka": ["Brand Designer", "Marketing Designer"],
  "ürün tasarımı": ["Product Designer", "Industrial Designer"],
  "endüstriyel tasarım": ["Industrial Designer", "Product Designer"],
  
  // ===== PAZARLAMA SEKTÖRÜ =====
  "pazarlama": ["Marketing Specialist", "Digital Marketing Manager", "Marketing Manager"],
  "dijital pazarlama": ["Digital Marketing Specialist", "Online Marketing Manager"],
  "satış": ["Sales Manager", "Business Development", "Sales Representative"],
  "satış müdürü": ["Sales Manager", "Sales Director"],
  "iş geliştirme": ["Business Development Manager", "Business Development Specialist"],
  "reklam": ["Advertising Manager", "Ad Campaign Specialist"],
  "marka yöneticisi": ["Brand Manager", "Brand Specialist"],
  "sosyal medya": ["Social Media Manager", "Digital Marketing Specialist"],
  "sosyal medya uzmanı": ["Social Media Specialist", "Social Media Manager"],
  "içerik": ["Content Creator", "Content Writer", "Content Manager"],
  "içerik yazarı": ["Content Writer", "Copywriter"],
  "copywriter": ["Copywriter", "Content Writer"],
  "seo": ["SEO Specialist", "SEO Manager"],
  "google ads": ["PPC Specialist", "Google Ads Manager"],
  "ppc": ["PPC Specialist", "Paid Advertising Manager"],
  "email marketing": ["Email Marketing Specialist", "Email Campaign Manager"],
  "affiliate": ["Affiliate Manager", "Partnership Manager"],
  "influencer": ["Influencer Marketing Manager", "Partnership Specialist"],
  
  // ===== FİNANS SEKTÖRÜ =====
  "finans": ["Financial Analyst", "Accountant", "Finance Manager"],
  "finansal analist": ["Financial Analyst", "Investment Analyst"],
  "muhasebe": ["Accountant", "Financial Controller", "Bookkeeper"],
  "muhasebeci": ["Accountant", "Financial Controller"],
  "finansal kontrolör": ["Financial Controller", "Finance Manager"],
  "yatırım": ["Investment Analyst", "Portfolio Manager"],
  "portföy yöneticisi": ["Portfolio Manager", "Investment Manager"],
  "risk yönetimi": ["Risk Manager", "Risk Analyst"],
  "risk analisti": ["Risk Analyst", "Risk Manager"],
  "kredi": ["Credit Analyst", "Loan Officer"],
  "kredi analisti": ["Credit Analyst", "Risk Analyst"],
  "sigorta": ["Insurance Agent", "Underwriter"],
  "sigorta uzmanı": ["Insurance Specialist", "Underwriter"],
  "denetim": ["Auditor", "Internal Auditor"],
  "denetçi": ["Auditor", "Internal Auditor"],
  "fintech": ["FinTech Specialist", "Financial Technology Manager"],
  "kripto": ["Cryptocurrency Analyst", "Blockchain Specialist"],
  
  // ===== SAĞLIK SEKTÖRÜ =====
  "sağlık": ["Healthcare Specialist", "Medical Advisor", "Health Manager"],
  "tıp": ["Medical Advisor", "Healthcare Consultant", "Doctor"],
  "doktor": ["Doctor", "Physician", "Medical Specialist"],
  "hemşire": ["Nurse", "Nursing Specialist"],
  "eczacı": ["Pharmacist", "Pharmacy Manager"],
  "diş hekimi": ["Dentist", "Dental Specialist"],
  "psikolog": ["Psychologist", "Mental Health Specialist", "Behavioral Researcher"],
  "fizyoterapist": ["Physiotherapist", "Physical Therapist"],
  "beslenme": ["Nutritionist", "Dietitian"],
  "beslenme uzmanı": ["Nutritionist", "Dietitian"],
  "laboratuvar": ["Lab Technician", "Medical Laboratory Scientist"],
  "radyoloji": ["Radiologist", "Radiology Technician"],
  "cerrahi": ["Surgeon", "Surgical Specialist"],
  "pediatri": ["Pediatrician", "Child Health Specialist"],
  "kardiyoloji": ["Cardiologist", "Heart Specialist"],
  "nöroloji": ["Neurologist", "Brain Specialist"],
  "ortopedi": ["Orthopedist", "Bone Specialist"],
  "dermatoloji": ["Dermatologist", "Skin Specialist"],
  "göz": ["Ophthalmologist", "Eye Specialist"],
  "kadın doğum": ["Gynecologist", "Women's Health Specialist"],
  
  // ===== EĞİTİM SEKTÖRÜ =====
  "eğitim": ["Training Specialist", "Educational Content Creator", "Education Manager"],
  "öğretim": ["Educational Content Creator", "Training Specialist", "Teacher"],
  "öğretmen": ["Teacher", "Instructor", "Educator"],
  "eğitmen": ["Trainer", "Instructor", "Training Specialist"],
  "akademisyen": ["Academic", "Professor", "Researcher"],
  "profesör": ["Professor", "Academic", "Researcher"],
  "araştırmacı": ["Researcher", "Research Analyst"],
  "müfredat": ["Curriculum Developer", "Educational Designer"],
  "müfredat geliştirici": ["Curriculum Developer", "Educational Designer"],
  "online eğitim": ["Online Learning Specialist", "E-Learning Manager"],
  "e-learning": ["E-Learning Specialist", "Online Learning Manager"],
  "koçluk": ["Coach", "Life Coach", "Business Coach"],
  "koç": ["Coach", "Life Coach", "Business Coach"],
  "mentorluk": ["Mentor", "Mentoring Specialist"],
  "mentor": ["Mentor", "Mentoring Specialist"],
  "sertifika": ["Certification Specialist", "Training Coordinator"],
  "workshop": ["Workshop Facilitator", "Training Specialist"],
  
  // ===== HUKUK SEKTÖRÜ =====
  "hukuk": ["Legal Advisor", "Lawyer", "Legal Consultant"],
  "avukat": ["Lawyer", "Attorney", "Legal Counsel"],
  "hukuk danışmanı": ["Legal Advisor", "Legal Consultant"],
  "noter": ["Notary", "Notary Public"],
  "hakim": ["Judge", "Magistrate"],
  "savcı": ["Prosecutor", "District Attorney"],
  "arabulucu": ["Mediator", "Arbitrator"],
  "tahkim": ["Arbitrator", "Mediator"],
  "ticaret hukuku": ["Commercial Lawyer", "Business Law Specialist"],
  "ceza hukuku": ["Criminal Lawyer", "Criminal Defense Attorney"],
  "aile hukuku": ["Family Lawyer", "Family Law Specialist"],
  "gayrimenkul hukuku": ["Real Estate Lawyer", "Property Law Specialist"],
  "iş hukuku": ["Labor Lawyer", "Employment Law Specialist"],
  "vergi hukuku": ["Tax Lawyer", "Tax Law Specialist"],
  "fikri mülkiyet": ["Intellectual Property Lawyer", "IP Specialist"],
  "patent": ["Patent Attorney", "Patent Specialist"],
  "telif hakkı": ["Copyright Lawyer", "IP Specialist"],
  
  // ===== İNSAN KAYNAKLARI =====
  "insan kaynakları": ["HR Manager", "Recruiter", "Human Resources Specialist"],
  "ik": ["HR Manager", "Human Resources Specialist"],
  "işe alım": ["Recruiter", "Talent Acquisition Specialist"],
  "işe alım uzmanı": ["Recruiter", "Talent Acquisition Specialist"],
  "yetenek yönetimi": ["Talent Manager", "Talent Acquisition Specialist"],
  "performans yönetimi": ["Performance Manager", "HR Specialist"],
  "ücretlendirme": ["Compensation Specialist", "Payroll Manager"],
  "ücretlendirme uzmanı": ["Compensation Specialist", "Payroll Manager"],
  "eğitim ve gelişim": ["Training and Development Specialist", "Learning Manager"],
  "organizasyonel gelişim": ["Organizational Development Specialist", "OD Manager"],
  "çalışan ilişkileri": ["Employee Relations Specialist", "HR Manager"],
  "iş güvenliği": ["Occupational Safety Specialist", "Safety Manager"],
  "sosyal güvenlik": ["Social Security Specialist", "Benefits Manager"],
  
  // ===== OPERASYON VE LOJİSTİK =====
  "operasyon": ["Operations Manager", "Process Manager", "Operations Specialist"],
  "süreç": ["Process Manager", "Operations Analyst", "Process Improvement Specialist"],
  "kalite": ["Quality Assurance", "Process Manager", "Quality Control Specialist"],
  "tedarik": ["Supply Chain Manager", "Procurement Specialist", "Sourcing Manager"],
  "lojistik": ["Logistics Manager", "Operations Manager", "Supply Chain Specialist"],
  "depo": ["Warehouse Manager", "Inventory Manager"],
  "depo yöneticisi": ["Warehouse Manager", "Inventory Manager"],
  "envanter": ["Inventory Manager", "Stock Controller"],
  "nakliye": ["Shipping Manager", "Transportation Manager"],
  "ulaştırma": ["Transportation Manager", "Logistics Manager"],
  "satın alma": ["Procurement Manager", "Purchasing Manager"],
  "satın alma uzmanı": ["Procurement Specialist", "Purchasing Specialist"],
  "tedarik zinciri": ["Supply Chain Manager", "Supply Chain Specialist"],
  "üretim": ["Production Manager", "Manufacturing Manager"],
  "üretim müdürü": ["Production Manager", "Manufacturing Manager"],
  "planlama": ["Planner", "Strategy Consultant", "Planning Manager"],
  "proje yönetimi": ["Project Manager", "Program Manager"],
  "proje müdürü": ["Project Manager", "Program Manager"],
  
  // ===== GAYRİMENKUL SEKTÖRÜ =====
  "gayrimenkul": ["Real Estate Specialist", "Property Manager", "Real Estate Agent"],
  "emlak": ["Real Estate Agent", "Property Manager", "Real Estate Specialist"],
  "emlak danışmanı": ["Real Estate Agent", "Real Estate Consultant"],
  "gayrimenkul danışmanı": ["Real Estate Consultant", "Property Advisor"],
  "mülk yöneticisi": ["Property Manager", "Real Estate Manager"],
  "inşaat": ["Construction Manager", "Site Engineer", "Construction Specialist"],
  "inşaat müdürü": ["Construction Manager", "Site Manager"],
  "mimar": ["Architect", "Architectural Designer"],
  "mimari": ["Architect", "Architectural Designer"],
  "iç mimar": ["Interior Designer", "Interior Architect"],
  "iç mimari": ["Interior Designer", "Interior Architect"],
  "peyzaj": ["Landscape Architect", "Landscape Designer"],
  "peyzaj mimarı": ["Landscape Architect", "Landscape Designer"],
  "şehir planlamacısı": ["Urban Planner", "City Planner"],
  "şehir planlama": ["Urban Planner", "City Planning Specialist"],
  
  // ===== MEDYA VE İLETİŞİM =====
  "medya": ["Media Specialist", "Media Manager", "Communications Specialist"],
  "iletişim": ["Communication Specialist", "PR Manager", "Communications Manager"],
  "halkla ilişkiler": ["PR Manager", "Communication Specialist", "Public Relations Specialist"],
  "pr": ["PR Manager", "Public Relations Specialist"],
  "basın": ["Press Officer", "Media Relations Specialist"],
  "basın danışmanı": ["Press Officer", "Media Relations Specialist"],
  "gazeteci": ["Journalist", "Reporter", "News Writer"],
  "editör": ["Editor", "Content Editor", "Managing Editor"],
  "yayıncı": ["Publisher", "Publishing Manager"],
  "yayın yöneticisi": ["Publishing Manager", "Editorial Manager"],
  "radyo": ["Radio Producer", "Radio Manager"],
  "televizyon": ["TV Producer", "Television Manager"],
  "tv": ["TV Producer", "Television Manager"],
  "sinema": ["Film Producer", "Cinema Manager"],
  "film": ["Film Producer", "Cinema Manager"],
  "reklam filmi": ["Commercial Director", "Advertising Producer"],
  "belgesel": ["Documentary Producer", "Documentary Director"],
  
  // ===== TURİZM VE HİZMETLER =====
  "turizm": ["Tourism Manager", "Travel Specialist", "Tourism Consultant"],
  "seyahat": ["Travel Agent", "Travel Specialist", "Tourism Manager"],
  "otel": ["Hotel Manager", "Hospitality Manager", "Hotel Specialist"],
  "otel müdürü": ["Hotel Manager", "Hospitality Manager"],
  "konaklama": ["Accommodation Manager", "Hospitality Specialist"],
  "restoran": ["Restaurant Manager", "Food Service Manager"],
  "restoran müdürü": ["Restaurant Manager", "Food Service Manager"],
  "catering": ["Catering Manager", "Food Service Specialist"],
  "etkinlik": ["Event Manager", "Event Coordinator", "Event Planner"],
  "etkinlik yöneticisi": ["Event Manager", "Event Coordinator"],
  "organizasyon": ["Organizer", "Event Manager", "Event Coordinator"],
  "kongre": ["Conference Manager", "Event Manager"],
  "kongre müdürü": ["Conference Manager", "Event Manager"],
  "rehber": ["Tour Guide", "Travel Guide"],
  "tur rehberi": ["Tour Guide", "Travel Guide"],
  
  // ===== ENERJİ VE ÇEVRE =====
  "enerji": ["Energy Manager", "Energy Specialist", "Energy Consultant"],
  "elektrik": ["Electrical Engineer", "Power Engineer", "Electrical Specialist"],
  "elektrik mühendisi": ["Electrical Engineer", "Power Engineer"],
  "güneş": ["Solar Engineer", "Renewable Energy Specialist"],
  "güneş enerjisi": ["Solar Engineer", "Renewable Energy Specialist"],
  "rüzgar": ["Wind Energy Specialist", "Renewable Energy Engineer"],
  "rüzgar enerjisi": ["Wind Energy Specialist", "Renewable Energy Engineer"],
  "yenilenebilir": ["Renewable Energy Specialist", "Clean Energy Manager"],
  "yenilenebilir enerji": ["Renewable Energy Specialist", "Clean Energy Manager"],
  "çevre": ["Environmental Specialist", "Environmental Engineer", "Sustainability Manager"],
  "çevre mühendisi": ["Environmental Engineer", "Environmental Specialist"],
  "sürdürülebilirlik": ["Sustainability Manager", "Environmental Specialist"],
  "atık yönetimi": ["Waste Management Specialist", "Environmental Manager"],
  "su yönetimi": ["Water Management Specialist", "Environmental Engineer"],
  "hava kalitesi": ["Air Quality Specialist", "Environmental Engineer"],
  
  // ===== ARAŞTIRMA VE GELİŞTİRME =====
  "araştırma": ["Research Analyst", "Market Researcher", "Research Manager"],
  "pazar": ["Market Researcher", "Business Analyst", "Market Analyst"],
  "pazar araştırması": ["Market Researcher", "Market Analyst"],
  "pazar analizi": ["Market Analyst", "Market Researcher"],
  "kullanıcı araştırması": ["User Researcher", "UX Researcher"],
  "kullanıcı deneyimi": ["UX Researcher", "User Experience Specialist"],
  "veri analizi": ["Data Analyst", "Business Intelligence Analyst"],
  "veri bilimi": ["Data Scientist", "Data Analyst"],
  "istatistik": ["Statistician", "Statistical Analyst"],
  "istatistikçi": ["Statistician", "Statistical Analyst"],
  "sosyoloji": ["Sociologist", "Social Researcher"],
  "sosyolog": ["Sociologist", "Social Researcher"],
  "psikoloji": ["Psychologist", "Behavioral Researcher"],
  // psikolog already defined above
  "antropoloji": ["Anthropologist", "Cultural Researcher"],
  "antropolog": ["Anthropologist", "Cultural Researcher"],
  
  // ===== GÜVENLİK VE SAVUNMA =====
  // güvenlik already defined above
  "siber güvenlik": ["Cybersecurity Specialist", "Information Security Analyst"],
  "bilgi güvenliği": ["Information Security Specialist", "Cybersecurity Analyst"],
  "ağ güvenliği": ["Network Security Specialist", "Cybersecurity Engineer"],
  "penetrasyon testi": ["Penetration Tester", "Security Tester"],
  "güvenlik testi": ["Security Tester", "Penetration Tester"],
  "forensic": ["Digital Forensics Specialist", "Computer Forensics Analyst"],
  "dijital adli analiz": ["Digital Forensics Specialist", "Computer Forensics Analyst"],
  "fiziksel güvenlik": ["Physical Security Specialist", "Security Officer"],
  "koruma": ["Security Officer", "Protection Specialist"],
  "bodyguard": ["Bodyguard", "Personal Protection Specialist"],
  "özel koruma": ["Personal Protection Specialist", "Bodyguard"],
  
  // ===== SPOR VE FITNESS =====
  "spor": ["Sports Manager", "Athletic Trainer", "Sports Specialist"],
  "fitness": ["Fitness Trainer", "Personal Trainer", "Fitness Specialist"],
  "kişisel antrenör": ["Personal Trainer", "Fitness Trainer"],
  "spor antrenörü": ["Sports Coach", "Athletic Trainer"],
  "yoga": ["Yoga Instructor", "Yoga Teacher"],
  "yoga eğitmeni": ["Yoga Instructor", "Yoga Teacher"],
  "pilates": ["Pilates Instructor", "Pilates Teacher"],
  "pilates eğitmeni": ["Pilates Instructor", "Pilates Teacher"],
  "dans": ["Dance Instructor", "Dance Teacher"],
  "dans eğitmeni": ["Dance Instructor", "Dance Teacher"],
  "yüzme": ["Swimming Instructor", "Swimming Coach"],
  "yüzme antrenörü": ["Swimming Coach", "Swimming Instructor"],
  "futbol": ["Football Coach", "Soccer Coach"],
  "futbol antrenörü": ["Football Coach", "Soccer Coach"],
  "basketbol": ["Basketball Coach", "Basketball Trainer"],
  "basketbol antrenörü": ["Basketball Coach", "Basketball Trainer"],
  
  // ===== SANAT VE YARATICILIK =====
  "sanat": ["Artist", "Art Director", "Creative Director"],
  "sanatçı": ["Artist", "Creative Professional"],
  "ressam": ["Painter", "Visual Artist"],
  "heykeltıraş": ["Sculptor", "Sculpture Artist"],
  "fotoğrafçı": ["Photographer", "Photo Artist"],
  "fotoğraf": ["Photographer", "Photo Artist"],
  "video": ["Video Editor", "Content Creator", "Video Producer"],
  "video editörü": ["Video Editor", "Video Producer"],
  "müzik": ["Musician", "Music Producer", "Composer"],
  "müzisyen": ["Musician", "Music Producer"],
  "şarkıcı": ["Singer", "Vocalist"],
  "gitarist": ["Guitarist", "Musician"],
  "piyanist": ["Pianist", "Musician"],
  "davulcu": ["Drummer", "Musician"],
  "dj": ["DJ", "Disc Jockey"],
  "tasarımcı": ["Designer", "Creative Designer"],
  "moda": ["Fashion Designer", "Fashion Stylist"],
  "moda tasarımcısı": ["Fashion Designer", "Fashion Stylist"],
  "kuaför": ["Hair Stylist", "Hair Designer"],
  "saç tasarımcısı": ["Hair Stylist", "Hair Designer"],
  "makyaj": ["Makeup Artist", "Beauty Specialist"],
  "makyaj sanatçısı": ["Makeup Artist", "Beauty Specialist"],
  
  // ===== DANIŞMANLIK VE KOÇLUK =====
  "danışmanlık": ["Consultant", "Business Consultant", "Management Consultant"],
  "danışman": ["Consultant", "Business Consultant"],
  "strateji danışmanı": ["Strategy Consultant", "Strategic Advisor"],
  "yönetim danışmanı": ["Management Consultant", "Business Advisor"],
  "iş danışmanı": ["Business Consultant", "Business Advisor"],
  "finansal danışman": ["Financial Advisor", "Financial Consultant"],
  "yatırım danışmanı": ["Investment Advisor", "Investment Consultant"],
  "vergi danışmanı": ["Tax Advisor", "Tax Consultant"],
  // hukuk danışmanı already defined above
  "pazarlama danışmanı": ["Marketing Consultant", "Marketing Advisor"],
  "insan kaynakları danışmanı": ["HR Consultant", "Human Resources Advisor"],
  "it danışmanı": ["IT Consultant", "Technology Advisor"],
  "teknoloji danışmanı": ["Technology Consultant", "IT Advisor"],
  "süreç danışmanı": ["Process Consultant", "Operations Advisor"],
  "kalite danışmanı": ["Quality Consultant", "Quality Advisor"],
  "çevre danışmanı": ["Environmental Consultant", "Environmental Advisor"],
  "sürdürülebilirlik danışmanı": ["Sustainability Consultant", "Sustainability Advisor"],
  
  // ===== GENEL VE ÇAPRAZ BECERİLER =====
  "liderlik": ["Team Lead", "Manager", "Director", "Leader"],
  "koordinasyon": ["Coordinator", "Project Manager", "Team Coordinator"],
  // planlama already defined above
  // organizasyon already defined above
  "müşteri": ["Customer Success Manager", "Account Manager", "Customer Service Specialist"],
  "müşteri hizmetleri": ["Customer Service Manager", "Customer Success Specialist"],
  "satış sonrası": ["After Sales Specialist", "Customer Success Manager"],
  "teknik destek": ["Technical Support Specialist", "IT Support Engineer"],
  "destek": ["Support Specialist", "Customer Service Representative"],
  "kalite kontrol": ["Quality Control Specialist", "Quality Assurance Manager"],
  "test": ["Tester", "Quality Assurance Specialist", "Test Engineer"],
  "test mühendisi": ["Test Engineer", "QA Engineer"],
  "dokümantasyon": ["Technical Writer", "Documentation Specialist"],
  "teknik yazar": ["Technical Writer", "Documentation Specialist"],
  "çeviri": ["Translator", "Localization Specialist", "Interpreter"],
  "dil": ["Language Specialist", "Translator", "Interpreter"],
  "simultane": ["Simultaneous Interpreter", "Conference Interpreter"],
  "ardıl": ["Consecutive Interpreter", "Interpreter"],
  "lokalizasyon": ["Localization Specialist", "Translation Manager"],
  "kültürlerarası": ["Cross-cultural Specialist", "Intercultural Consultant"],
  "uluslararası": ["International Specialist", "Global Business Manager"],
  "ihracat": ["Export Manager", "International Trade Specialist"],
  "ithalat": ["Import Manager", "International Trade Specialist"],
  "dış ticaret": ["International Trade Specialist", "Export/Import Manager"],
  "gümrük": ["Customs Specialist", "Customs Broker"],
  "gümrük müşaviri": ["Customs Broker", "Customs Specialist"]
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
  expertiseMatch: number;
  servicesMatch: number;
  sectorsMatch: number;
  relationshipScore: number;
  availabilityScore: number;
  locationScore: number;
  totalScore: number;
  matchedRoles: string[];
  matchedSkills: string[];
  matchedExpertise: string[];
  matchedServices: string[];
  matchedSectors: string[];
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
    // Enhanced contact data extraction with new comprehensive fields
    const contactData = [
      contact.first_name || "",
      contact.last_name || "",
      contact.profession || "",
      contact.company || "",
      contact.profession || "", // Use profession instead of role
      contact.current_city || "",
      contact.birth_city || "",
      contact.age || "",
      contact.education_school || "",
      contact.education_department || "",
      contact.education_degree || "",
      contact.work_experience || "",
      contact.goals || "",
      contact.vision || "",
      contact.interests || "",
      contact.volunteer_work || "",
      contact.turning_points || "",
      contact.challenges || "",
      contact.lessons || "",
      contact.future_goals || "",
      contact.business_ideas || "",
      contact.collaboration_areas || "",
      contact.description || "",
      ...(contact.services || []),
      ...(contact.sectors || []),
      ...(contact.expertise || []),
      ...(contact.personal_traits || []),
      ...(contact.values || []),
      ...(contact.languages || []),
      ...(contact.tags || [])
    ].join(" ").toLowerCase();
    
    // Enhanced role matching with semantic variations and profession focus
    let roleMatch = 0;
    const matchedRoles: string[] = [];
    
    // FIRST: Check profession field directly against extracted skills (yazılım şirketi -> yazılım mühendisi)
    requirements.extractedSkills.forEach(skill => {
      if (contact.profession && contact.profession.toLowerCase().includes(skill.toLowerCase())) {
        roleMatch += 5; // Very high score for profession containing required skill
        matchedRoles.push(`${contact.profession} (${skill})`);
      }
    });
    
    // SECOND: Traditional role matching
    requirements.extractedRoles.forEach(role => {
      const roleLower = role.toLowerCase();
      
      // Direct match
      if (contactData.includes(roleLower) || 
          contact.profession?.toLowerCase().includes(roleLower)) {
        roleMatch += 3; // Increased from 2
        matchedRoles.push(role);
      }
      // Software Engineer specific matching
      else if (roleLower.includes("software engineer") && 
               (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                contact.profession?.toLowerCase().includes("software engineer") ||
                contact.profession?.toLowerCase().includes("mühendis"))) {
        roleMatch += 3; // Increased score
        matchedRoles.push(role);
      }
      // Frontend Developer matching for Software Engineers
      else if (roleLower.includes("frontend developer") && 
               (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                contact.profession?.toLowerCase().includes("software engineer") ||
                contact.profession?.toLowerCase().includes("frontend") ||
                contact.profession?.toLowerCase().includes("web"))) {
        roleMatch += 3;
        matchedRoles.push(role);
      }
      // Backend Developer matching for Software Engineers
      else if (roleLower.includes("backend developer") && 
               (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                contact.profession?.toLowerCase().includes("software engineer") ||
                contact.profession?.toLowerCase().includes("backend") ||
                contact.profession?.toLowerCase().includes("server"))) {
        roleMatch += 3;
        matchedRoles.push(role);
      }
      // Project Manager matching for experienced Software Engineers
      else if (roleLower.includes("project manager") && 
               (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                contact.profession?.toLowerCase().includes("software engineer") ||
                contact.profession?.toLowerCase().includes("mühendis") ||
                contact.profession?.toLowerCase().includes("manager") ||
                contact.profession?.toLowerCase().includes("lead"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Software Developer specific matching
      else if (roleLower.includes("software developer") && 
               (contact.profession?.toLowerCase().includes("yazılım geliştirici") || 
                contact.profession?.toLowerCase().includes("software developer") ||
                contact.profession?.toLowerCase().includes("developer"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Marketing Specialist specific matching
      else if (roleLower.includes("marketing specialist") && 
               (contact.profession?.toLowerCase().includes("pazarlama uzmanı") || 
                contact.profession?.toLowerCase().includes("marketing specialist") ||
                contact.profession?.toLowerCase().includes("pazarlama"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Financial Analyst specific matching
      else if (roleLower.includes("financial analyst") && 
               (contact.profession?.toLowerCase().includes("finansal analist") || 
                contact.profession?.toLowerCase().includes("financial analyst") ||
                contact.profession?.toLowerCase().includes("finans"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Healthcare Specialist specific matching
      else if (roleLower.includes("healthcare specialist") && 
               (contact.profession?.toLowerCase().includes("sağlık uzmanı") || 
                contact.profession?.toLowerCase().includes("healthcare specialist") ||
                contact.profession?.toLowerCase().includes("sağlık"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Legal Advisor specific matching
      else if (roleLower.includes("legal advisor") && 
               (contact.profession?.toLowerCase().includes("hukuk danışmanı") || 
                contact.profession?.toLowerCase().includes("legal advisor") ||
                contact.profession?.toLowerCase().includes("avukat"))) {
        roleMatch += 2;
        matchedRoles.push(role);
      }
      // Real Estate Specialist specific matching
      else if (roleLower.includes("real estate specialist") && 
               (contact.profession?.toLowerCase().includes("gayrimenkul uzmanı") || 
                contact.profession?.toLowerCase().includes("real estate specialist") ||
                contact.profession?.toLowerCase().includes("emlak"))) {
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
      // Company-based role inference
      else if (contact.company && roleLower.includes("manager") && 
               (contact.company.toLowerCase().includes("manager") || contact.company.toLowerCase().includes("director"))) {
        roleMatch += 0.5;
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
      else if (skill === "yazılım" && (contactData.includes("developer") || contactData.includes("programmer") || contactData.includes("engineer"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      // Enhanced software development matching
      else if (skill === "yazılım" && (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                                       contact.profession?.toLowerCase().includes("software engineer") ||
                                       contact.profession?.toLowerCase().includes("yazılım geliştirici") ||
                                       contact.profession?.toLowerCase().includes("software developer"))) {
        skillMatch += 5; // Much higher score for software engineers
        matchedSkills.push(skill);
      }
      else if (skill === "programlama" && (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                                          contact.profession?.toLowerCase().includes("software engineer") ||
                                          contact.profession?.toLowerCase().includes("yazılım geliştirici") ||
                                          contact.profession?.toLowerCase().includes("software developer"))) {
        skillMatch += 5; // Much higher score for software engineers
        matchedSkills.push(skill);
      }
      else if (skill === "kod" && (contact.profession?.toLowerCase().includes("yazılım mühendisi") || 
                                  contact.profession?.toLowerCase().includes("software engineer") ||
                                  contact.profession?.toLowerCase().includes("yazılım geliştirici") ||
                                  contact.profession?.toLowerCase().includes("software developer"))) {
        skillMatch += 5; // Much higher score for software engineers
        matchedSkills.push(skill);
      }
      else if (skill === "tasarım" && (contactData.includes("designer") || contactData.includes("ui") || contactData.includes("ux") || contactData.includes("grafik"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "pazarlama" && (contactData.includes("marketing") || contactData.includes("sales") || contactData.includes("reklam"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "veri" && (contactData.includes("data") || contactData.includes("analyst") || contactData.includes("analiz"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      // Experience-based skill inference
      else if (skill === "liderlik" && (contactData.includes("manager") || contactData.includes("director") || contactData.includes("lead"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
      else if (skill === "iletişim" && (contactData.includes("communication") || contactData.includes("pr") || contactData.includes("halkla ilişkiler"))) {
        skillMatch += 1;
        matchedSkills.push(skill);
      }
    });
    
    // Relationship score (0-10 scale)
    const relationshipScore = contact.relationship_degree || 5;
    
    // Enhanced availability score based on comprehensive data
    let availabilityScore = 5; // Default
    const availabilityKeywords = {
      high: ["müsait", "available", "boş", "free", "açık", "open", "hazır", "ready"],
      low: ["meşgul", "busy", "dolu", "full", "kapalı", "closed", "yoğun", "occupied"]
    };
    
    // Check work experience and current status
    if (contact.work_experience) {
      if (availabilityKeywords.high.some(keyword => contact.work_experience.toLowerCase().includes(keyword))) {
        availabilityScore = 8;
      } else if (availabilityKeywords.low.some(keyword => contact.work_experience.toLowerCase().includes(keyword))) {
        availabilityScore = 3;
      }
    }
    
    // Check if person is actively looking for opportunities
    if (contact.future_goals && contact.future_goals.toLowerCase().includes("yeni")) {
      availabilityScore += 1;
    }
    
    if (contact.business_ideas && contact.business_ideas.length > 0) {
      availabilityScore += 0.5; // Shows entrepreneurial spirit
    }
    
    // Enhanced location score
    let locationScore = 5; // Default
    if (requirements.location === "local" && contact.current_city) {
      locationScore = 8; // Bonus for having current location info
    } else if (requirements.location === "remote" && contactData.includes("remote")) {
      locationScore = 8; // Bonus for remote preference
    }
    
    // Check if person has moved recently (shows flexibility)
    if (contact.turning_points && contact.turning_points.toLowerCase().includes("şehir") || 
        contact.turning_points.toLowerCase().includes("city")) {
      locationScore += 1;
    }
    
    // Domain alignment bonus with enhanced matching
    let domainBonus = 0;
    if (requirements.domain === "teknoloji" && 
        (contactData.includes("developer") || contactData.includes("engineer") || contactData.includes("tech") || 
         contactData.includes("yazılım") || contactData.includes("programlama"))) {
      domainBonus = 1;
    } else if (requirements.domain === "pazarlama" && 
               (contactData.includes("marketing") || contactData.includes("sales") || contactData.includes("brand") ||
                contactData.includes("pazarlama") || contactData.includes("reklam"))) {
      domainBonus = 1;
    } else if (requirements.domain === "finans" && 
               (contactData.includes("finance") || contactData.includes("accounting") || contactData.includes("financial") ||
                contactData.includes("finans") || contactData.includes("muhasebe"))) {
      domainBonus = 1;
    } else if (requirements.domain === "sağlık" && 
               (contactData.includes("health") || contactData.includes("medical") || contactData.includes("healthcare") ||
                contactData.includes("sağlık") || contactData.includes("tıp"))) {
      domainBonus = 1;
    } else if (requirements.domain === "eğitim" && 
               (contactData.includes("education") || contactData.includes("training") || contactData.includes("teaching") ||
                contactData.includes("eğitim") || contactData.includes("öğretim"))) {
      domainBonus = 1;
    }
    
    // Enhanced professional experience bonus with skill matching
    let experienceBonus = 0;
    if (contact.work_experience && contact.work_experience.length > 100) {
      experienceBonus = 1; // Increased bonus for detailed work experience
    }
    if (contact.age && parseInt(contact.age) > 30) {
      experienceBonus += 0.5; // Increased bonus for age/experience
    }
    
    // Bonus for work experience containing required skills
    if (contact.work_experience) {
      requirements.extractedSkills.forEach(skill => {
        if (contact.work_experience!.toLowerCase().includes(skill.toLowerCase())) {
          experienceBonus += 2; // High bonus for relevant work experience
        }
      });
    }
    
    // Bonus for company name containing required skills or domain
    let companyBonus = 0;
    if (contact.company) {
      requirements.extractedSkills.forEach(skill => {
        if (contact.company!.toLowerCase().includes(skill.toLowerCase())) {
          companyBonus += 1; // Bonus for relevant company
        }
      });
      // Domain-specific company bonus
      if (requirements.domain === "teknoloji" && 
          (contact.company.toLowerCase().includes("teknoloji") || 
           contact.company.toLowerCase().includes("software") ||
           contact.company.toLowerCase().includes("yazılım"))) {
        companyBonus += 2;
      }
    }
    
    // Education bonus
    let educationBonus = 0;
    if (contact.education_degree && contact.education_degree.toLowerCase().includes("master")) {
      educationBonus = 0.3;
    } else if (contact.education_degree && contact.education_degree.toLowerCase().includes("phd")) {
      educationBonus = 0.5;
    }
    
    // Language skills bonus
    let languageBonus = 0;
    if (contact.languages && contact.languages.length > 1) {
      languageBonus = 0.2 * contact.languages.length; // Bonus for each language
    }
    
    // Personal traits bonus
    let traitsBonus = 0;
    if (contact.personal_traits) {
      const valuableTraits = ["liderlik", "iletişim", "takım çalışması", "yaratıcılık", "adaptability"];
      valuableTraits.forEach(trait => {
        if (contact.personal_traits.includes(trait)) {
          traitsBonus += 0.2;
        }
      });
    }
    
    // Calculate expertise and services matches - ENHANCED FOR BETTER MATCHING
    let expertiseMatch = 0;
    const matchedExpertise: string[] = [];
    if (contact.expertise) {
      requirements.extractedSkills.forEach(skill => {
        contact.expertise!.forEach(expertise => {
          const expertiseLower = expertise.toLowerCase();
          const skillLower = skill.toLowerCase();
          
          // Exact match
          if (expertiseLower.includes(skillLower) || skillLower.includes(expertiseLower)) {
            expertiseMatch += 3; // Increased from 2
            if (!matchedExpertise.includes(skill)) {
              matchedExpertise.push(skill);
            }
          }
          // Semantic matching for software development
          else if (skillLower === "yazılım" && 
                   (expertiseLower.includes("software") || expertiseLower.includes("geliştirme") || 
                    expertiseLower.includes("development") || expertiseLower.includes("programming"))) {
            expertiseMatch += 4; // High bonus for software expertise
            if (!matchedExpertise.includes(skill)) {
              matchedExpertise.push(skill);
            }
          }
          // Semantic matching for design
          else if (skillLower === "tasarım" && 
                   (expertiseLower.includes("design") || expertiseLower.includes("ui") || 
                    expertiseLower.includes("ux") || expertiseLower.includes("grafik"))) {
            expertiseMatch += 4; // High bonus for design expertise
            if (!matchedExpertise.includes(skill)) {
              matchedExpertise.push(skill);
            }
          }
          // Semantic matching for marketing
          else if (skillLower === "pazarlama" && 
                   (expertiseLower.includes("marketing") || expertiseLower.includes("reklam") || 
                    expertiseLower.includes("advertising") || expertiseLower.includes("brand"))) {
            expertiseMatch += 4; // High bonus for marketing expertise
            if (!matchedExpertise.includes(skill)) {
              matchedExpertise.push(skill);
            }
          }
        });
      });
    }
    
    // Enhanced expertise matching for software development
    if (requirements.extractedSkills.includes("yazılım") || 
        requirements.extractedSkills.includes("programlama") || 
        requirements.extractedSkills.includes("kod")) {
      if (contact.expertise && contact.expertise.some(expertise => 
        expertise.toLowerCase().includes("yazılım geliştirme") ||
        expertise.toLowerCase().includes("software development") ||
        expertise.toLowerCase().includes("programlama") ||
        expertise.toLowerCase().includes("coding")
      )) {
        expertiseMatch += 3; // Higher bonus for software development expertise
        if (!matchedExpertise.includes("yazılım")) matchedExpertise.push("yazılım");
        if (!matchedExpertise.includes("programlama")) matchedExpertise.push("programlama");
      }
    }
    
    let servicesMatch = 0;
    const matchedServices: string[] = [];
    if (contact.services) {
      requirements.extractedSkills.forEach(skill => {
        contact.services!.forEach(service => {
          const serviceLower = service.toLowerCase();
          const skillLower = skill.toLowerCase();
          
          // Exact match
          if (serviceLower.includes(skillLower) || skillLower.includes(serviceLower)) {
            servicesMatch += 3; // Increased from 2
            if (!matchedServices.includes(skill)) {
              matchedServices.push(skill);
            }
          }
          // Semantic matching for software services
          else if (skillLower === "yazılım" && 
                   (serviceLower.includes("software") || serviceLower.includes("geliştirme") || 
                    serviceLower.includes("development") || serviceLower.includes("programming") ||
                    serviceLower.includes("web") || serviceLower.includes("mobile") || serviceLower.includes("app"))) {
            servicesMatch += 5; // Very high bonus for software services
            if (!matchedServices.includes(skill)) {
              matchedServices.push(skill);
            }
          }
          // Semantic matching for design services
          else if (skillLower === "tasarım" && 
                   (serviceLower.includes("design") || serviceLower.includes("ui") || 
                    serviceLower.includes("ux") || serviceLower.includes("grafik") ||
                    serviceLower.includes("logo") || serviceLower.includes("brand"))) {
            servicesMatch += 5; // Very high bonus for design services
            if (!matchedServices.includes(skill)) {
              matchedServices.push(skill);
            }
          }
          // Semantic matching for marketing services
          else if (skillLower === "pazarlama" && 
                   (serviceLower.includes("marketing") || serviceLower.includes("reklam") || 
                    serviceLower.includes("advertising") || serviceLower.includes("campaign") ||
                    serviceLower.includes("social") || serviceLower.includes("content"))) {
            servicesMatch += 5; // Very high bonus for marketing services
            if (!matchedServices.includes(skill)) {
              matchedServices.push(skill);
            }
          }
        });
      });
    }
    
    // Enhanced services matching for software development
    if (requirements.extractedSkills.includes("yazılım") || 
        requirements.extractedSkills.includes("programlama") || 
        requirements.extractedSkills.includes("kod")) {
      if (contact.services && contact.services.some(service => 
        service.toLowerCase().includes("yazılım geliştirme") ||
        service.toLowerCase().includes("software development") ||
        service.toLowerCase().includes("web geliştirme") ||
        service.toLowerCase().includes("web development") ||
        service.toLowerCase().includes("mobil uygulama") ||
        service.toLowerCase().includes("mobile app") ||
        service.toLowerCase().includes("programlama") ||
        service.toLowerCase().includes("coding")
      )) {
        servicesMatch += 3; // Higher bonus for software development services
        if (!matchedServices.includes("yazılım")) matchedServices.push("yazılım");
        if (!matchedServices.includes("programlama")) matchedServices.push("programlama");
      }
    }
    
    // Enhanced sectors matching 
    let sectorsMatch = 0;
    const matchedSectors: string[] = [];
    if (contact.sectors) {
      requirements.extractedSkills.forEach(skill => {
        if (contact.sectors!.some(sector => 
          sector.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(sector.toLowerCase())
        )) {
          sectorsMatch += 2;
          matchedSectors.push(skill);
        }
      });
      
      // Special bonus for technology sector
      if (requirements.domain === "teknoloji" && 
          contact.sectors.some(sector => 
            sector.toLowerCase().includes("teknoloji") ||
            sector.toLowerCase().includes("yazılım") ||
            sector.toLowerCase().includes("bilişim")
          )) {
        sectorsMatch += 4; // High bonus for tech sector match
        if (!matchedSectors.includes("teknoloji")) matchedSectors.push("teknoloji");
      }
          }
      
      // Calculate total score with EXPERTISE and SERVICES as TOP PRIORITY
      const totalScore = (
        expertiseMatch * 15 + // HIGHEST weight for expertise matches (UZMANLIK)
        servicesMatch * 12 + // VERY HIGH weight for services matches (HİZMETLER)
        roleMatch * 8 + // Reduced weight for profession matches (ünvan)
        sectorsMatch * 5 + // High weight for sectors matches (sektörler)
        skillMatch * 3 + // Reduced weight for general skill matching
        relationshipScore * 0.5 + 
        availabilityScore * 0.3 + 
        locationScore * 0.2 +
        domainBonus * 2 + // Increased domain bonus
        experienceBonus * 3 + // Increased experience bonus
        companyBonus * 4 + // High bonus for relevant company
        educationBonus +
        languageBonus +
        traitsBonus
      );
      
      return {
        contact,
        roleMatch,
        skillMatch,
        expertiseMatch,
        servicesMatch,
        sectorsMatch,
        relationshipScore,
        availabilityScore,
        locationScore,
        totalScore,
        matchedRoles,
        matchedSkills,
        matchedExpertise,
        matchedServices,
        matchedSectors
      };
  }).sort((a, b) => b.totalScore - a.totalScore);
}

// Generate team recommendations using different strategies with enhanced logic
export function generateTeamRecommendations(
  scoredCandidates: CandidateScore[],
  requirements: TeamRequirement
): TeamRecommendation[] {
  const recommendations: TeamRecommendation[] = [];
  
  // Fast Start Strategy - Prioritize expertise and services for fast deployment
  const fastStartMembers = scoredCandidates
    .sort((a, b) => {
      // Primary: Expertise + Services (skills-focused for fast start)
      const aSkillsScore = (a.expertiseMatch * 15) + (a.servicesMatch * 12);
      const bSkillsScore = (b.expertiseMatch * 15) + (b.servicesMatch * 12);
      if (aSkillsScore !== bSkillsScore) return bSkillsScore - aSkillsScore;
      
      // Secondary: Availability
      return b.availabilityScore - a.availabilityScore;
    })
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "fast_start",
    members: fastStartMembers,
    reasoning: "Hızlı başlangıç için uzmanlık ve hizmetler alanında en uygun kişiler seçildi. Bu ekip gerekli becerilere sahip olduğu için hızlıca projeye başlayabilir ve sonuç alabilir.",
    estimatedCost: requirements.budget === "low" ? "Düşük" : "Orta",
    timeline: requirements.urgency === "high" ? "1 hafta" : "1-2 hafta",
    riskLevel: "low",
    teamComposition: analyzeTeamComposition(fastStartMembers, requirements)
  });
  

  
  // Senior Leadership Strategy - Focus on role/title and experience
  const seniorMembers = scoredCandidates
    .sort((a, b) => {
      // Primary: Role matching (title-focused for leadership)
      const aRoleScore = (a.roleMatch * 10) + (a.relationshipScore * 2);
      const bRoleScore = (b.roleMatch * 10) + (b.relationshipScore * 2);
      if (aRoleScore !== bRoleScore) return bRoleScore - aRoleScore;
      
      // Secondary: Experience bonus (age, work experience)
      return b.totalScore - a.totalScore;
    })
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
  
  // Local Alignment Strategy - Focus on role matching and location
  const localMembers = scoredCandidates
    .sort((a, b) => {
      // Primary: Role matching (title-focused for professional alignment)
      if (a.roleMatch !== b.roleMatch) return b.roleMatch - a.roleMatch;
      
      // Secondary: Location compatibility
      return b.locationScore - a.locationScore;
    })
    .slice(0, requirements.teamSize);
  
  recommendations.push({
    strategy: "local_alignment",
    members: localMembers,
    reasoning: "Ünvan ve pozisyon uyumluluğu öncelikli olarak, yerel bölgeden kişiler seçildi. Bu ekip hem profesyonel uyum hem de coğrafi yakınlık sağlar.",
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
  
  // Software company and development project analysis
  if (description.includes("yazılım şirketi") || description.includes("software company") || 
      description.includes("yazılım firması") || description.includes("tech company") ||
      description.includes("yazılım işi") || description.includes("software job") ||
      description.includes("yazılım projesi") || description.includes("software project") ||
      description.includes("yazılım") || description.includes("software")) {
    // Software Engineer should be the PRIMARY role for software companies
    roles.push("Software Engineer"); // PRIMARY role - matches "Yazılım Mühendisi"
    roles.push("Software Developer", "Full Stack Developer");
    if (teamSize > 2) {
      roles.push("UI/UX Designer", "Project Manager");
    }
  }
  
  // Marketing company and campaign analysis
  if (description.includes("pazarlama şirketi") || description.includes("marketing company") ||
      description.includes("reklam ajansı") || description.includes("advertising agency") ||
      description.includes("pazarlama") || description.includes("marketing")) {
    roles.push("Marketing Specialist", "Digital Marketing Manager");
    if (teamSize > 2) {
      roles.push("Content Creator", "Social Media Manager");
    }
  }
  
  // Financial company and investment analysis
  if (description.includes("finans şirketi") || description.includes("financial company") ||
      description.includes("yatırım şirketi") || description.includes("investment company") ||
      description.includes("finans") || description.includes("finance")) {
    roles.push("Financial Analyst", "Accountant");
    if (teamSize > 2) {
      roles.push("Risk Manager", "Investment Advisor");
    }
  }
  
  // Healthcare company and medical analysis
  if (description.includes("sağlık şirketi") || description.includes("healthcare company") ||
      description.includes("hastane") || description.includes("hospital") ||
      description.includes("sağlık") || description.includes("health")) {
    roles.push("Healthcare Specialist", "Medical Advisor");
    if (teamSize > 2) {
      roles.push("Nurse", "Medical Administrator");
    }
  }
  
  // Education company and training analysis
  if (description.includes("eğitim şirketi") || description.includes("education company") ||
      description.includes("eğitim kurumu") || description.includes("training company") ||
      description.includes("eğitim") || description.includes("education")) {
    roles.push("Training Specialist", "Educational Content Creator");
    if (teamSize > 2) {
      roles.push("Curriculum Developer", "Learning Manager");
    }
  }
  
  // Legal company and law analysis
  if (description.includes("hukuk bürosu") || description.includes("law firm") ||
      description.includes("avukatlık") || description.includes("legal company") ||
      description.includes("hukuk") || description.includes("legal")) {
    roles.push("Legal Advisor", "Lawyer");
    if (teamSize > 2) {
      roles.push("Legal Assistant", "Paralegal");
    }
  }
  
  // Real estate company analysis
  if (description.includes("gayrimenkul şirketi") || description.includes("real estate company") ||
      description.includes("emlak şirketi") || description.includes("property company") ||
      description.includes("gayrimenkul") || description.includes("real estate")) {
    roles.push("Real Estate Specialist", "Property Manager");
    if (teamSize > 2) {
      roles.push("Real Estate Agent", "Property Consultant");
    }
  }
  
  // Media and communication company analysis
  if (description.includes("medya şirketi") || description.includes("media company") ||
      description.includes("iletişim şirketi") || description.includes("communication company") ||
      description.includes("medya") || description.includes("media")) {
    roles.push("Media Specialist", "Communication Specialist");
    if (teamSize > 2) {
      roles.push("Content Creator", "PR Manager");
    }
  }
  
  // Tourism and hospitality company analysis
  if (description.includes("turizm şirketi") || description.includes("tourism company") ||
      description.includes("otel") || description.includes("hotel") ||
      description.includes("turizm") || description.includes("tourism")) {
    roles.push("Tourism Manager", "Hotel Manager");
    if (teamSize > 2) {
      roles.push("Event Manager", "Customer Service Manager");
    }
  }
  
  // Energy and environment company analysis
  if (description.includes("enerji şirketi") || description.includes("energy company") ||
      description.includes("çevre şirketi") || description.includes("environmental company") ||
      description.includes("enerji") || description.includes("energy")) {
    roles.push("Energy Manager", "Environmental Specialist");
    if (teamSize > 2) {
      roles.push("Sustainability Manager", "Environmental Engineer");
    }
  }
  
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
    if (!roles.includes("Software Engineer")) roles.push("Software Engineer"); // PRIMARY for tech domain
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
      roles.push("Software Engineer"); // PRIMARY role for tech teams
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
  
  // Special handling for software company and development projects
  if (description.includes("yazılım şirketi") || description.includes("software company") || 
      description.includes("yazılım firması") || description.includes("tech company") ||
      description.includes("yazılım işi") || description.includes("software job") ||
      description.includes("yazılım projesi") || description.includes("software project")) {
    skills.push("yazılım", "programlama", "kod");
    if (description.includes("web") || description.includes("site")) skills.push("web");
    if (description.includes("mobil") || description.includes("app")) skills.push("mobil");
  }
  
  // Special handling for marketing company and campaign projects
  if (description.includes("pazarlama şirketi") || description.includes("marketing company") ||
      description.includes("reklam ajansı") || description.includes("advertising agency")) {
    skills.push("pazarlama", "reklam", "sosyal medya");
    if (description.includes("dijital") || description.includes("digital")) skills.push("dijital pazarlama");
    if (description.includes("içerik") || description.includes("content")) skills.push("içerik");
  }
  
  // Special handling for financial company and investment projects
  if (description.includes("finans şirketi") || description.includes("financial company") ||
      description.includes("yatırım şirketi") || description.includes("investment company")) {
    skills.push("finans", "muhasebe", "yatırım");
    if (description.includes("risk") || description.includes("risk")) skills.push("risk yönetimi");
    if (description.includes("kredi") || description.includes("credit")) skills.push("kredi");
  }
  
  // Special handling for healthcare company and medical projects
  if (description.includes("sağlık şirketi") || description.includes("healthcare company") ||
      description.includes("hastane") || description.includes("hospital")) {
    skills.push("sağlık", "tıp");
    if (description.includes("laboratuvar") || description.includes("lab")) skills.push("laboratuvar");
    if (description.includes("radyoloji") || description.includes("radiology")) skills.push("radyoloji");
  }
  
  // Special handling for education company and training projects
  if (description.includes("eğitim şirketi") || description.includes("education company") ||
      description.includes("eğitim kurumu") || description.includes("training company")) {
    skills.push("eğitim", "öğretim");
    if (description.includes("online") || description.includes("online")) skills.push("online eğitim");
    if (description.includes("koçluk") || description.includes("coaching")) skills.push("koçluk");
  }
  
  // Special handling for legal company and law projects
  if (description.includes("hukuk bürosu") || description.includes("law firm") ||
      description.includes("avukatlık") || description.includes("legal company")) {
    skills.push("hukuk", "avukat");
    if (description.includes("ticaret") || description.includes("commercial")) skills.push("ticaret hukuku");
    if (description.includes("ceza") || description.includes("criminal")) skills.push("ceza hukuku");
  }
  
  // Special handling for real estate company projects
  if (description.includes("gayrimenkul şirketi") || description.includes("real estate company") ||
      description.includes("emlak şirketi") || description.includes("property company")) {
    skills.push("gayrimenkul", "emlak");
    if (description.includes("inşaat") || description.includes("construction")) skills.push("inşaat");
    if (description.includes("mimar") || description.includes("architect")) skills.push("mimar");
  }
  
  // Special handling for media and communication company projects
  if (description.includes("medya şirketi") || description.includes("media company") ||
      description.includes("iletişim şirketi") || description.includes("communication company")) {
    skills.push("medya", "iletişim", "halkla ilişkiler");
    if (description.includes("basın") || description.includes("press")) skills.push("basın");
    if (description.includes("gazeteci") || description.includes("journalist")) skills.push("gazeteci");
  }
  
  // Special handling for tourism and hospitality company projects
  if (description.includes("turizm şirketi") || description.includes("tourism company") ||
      description.includes("otel") || description.includes("hotel")) {
    skills.push("turizm", "seyahat", "otel");
    if (description.includes("etkinlik") || description.includes("event")) skills.push("etkinlik");
    if (description.includes("rehber") || description.includes("guide")) skills.push("rehber");
  }
  
  // Special handling for energy and environment company projects
  if (description.includes("enerji şirketi") || description.includes("energy company") ||
      description.includes("çevre şirketi") || description.includes("environmental company")) {
    skills.push("enerji", "çevre", "sürdürülebilirlik");
    if (description.includes("güneş") || description.includes("solar")) skills.push("güneş");
    if (description.includes("rüzgar") || description.includes("wind")) skills.push("rüzgar");
  }
  
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
