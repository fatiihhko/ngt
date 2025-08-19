export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  city: string | null;
  profession: string | null;
  relationship_degree: number;
  tags: string[];
  phone: string | null;
  email: string | null;
  description: string | null;
  parent_contact_id: string | null;
  // New fields for premium network visualization
  avatar_url?: string | null;
  handle?: string | null;
  category?: "work" | "family" | "friend" | "other";
  created_at?: string;
  updated_at?: string;
  
  // Temel Bilgiler
  age?: string | null;
  birth_city?: string | null;
  current_city?: string | null;
  education_school?: string | null;
  education_department?: string | null;
  education_degree?: string | null;
  education_graduation_year?: string | null;
  
  // İş ve Profesyonel Bilgiler
  company?: string | null;
  sectors?: string[];
  custom_sector?: string;
  work_experience?: string;
  expertise?: string[];
  custom_expertise?: string;
  services?: string[];
  custom_service?: string;
  investments?: string | null;
  
  // Kişisel Özellikler
  personal_traits?: string[];
  values?: string[];
  goals?: string | null;
  vision?: string | null;
  
  // Sosyal ve Networking
  interests?: string;
  custom_interest?: string;
  languages?: string[];
  custom_language?: string;
  is_mentor?: boolean;
  volunteer_work?: string | null;
  
  // Kritik Yaşam Deneyimleri
  turning_points?: string | null;
  challenges?: string | null;
  lessons?: string | null;
  
  // İleriye Dönük Planlar
  future_goals?: string | null;
  business_ideas?: string | null;
  investment_interest?: boolean;
  collaboration_areas?: string | null;
};

// Enhanced types for network visualization
export type Person = {
  id: string;
  name: string;
  handle?: string;
  avatarUrl?: string;
  role?: string;
  city?: string;
  category?: "work" | "family" | "friend" | "other";
  closeness?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  createdAt: string;
  
  // Temel Bilgiler
  age?: string;
  birthCity?: string;
  currentCity?: string;
  education?: {
    school?: string;
    department?: string;
    degree?: string;
    graduationYear?: string;
  };
  
  // İş ve Profesyonel Bilgiler
  company?: string;
  sectors?: string[];
  customSector?: string;
  workExperience?: string;
  expertise?: string[];
  customExpertise?: string;
  services?: string[];
  customService?: string;
  investments?: string;
  
  // Kişisel Özellikler
  personalTraits?: string[];
  values?: string[];
  goals?: string;
  vision?: string;
  
  // Sosyal ve Networking
  interests?: string[];
  customInterest?: string;
  languages?: string[];
  customLanguage?: string;
  isMentor?: boolean;
  volunteerWork?: string;
  
  // Kritik Yaşam Deneyimleri
  turningPoints?: string;
  challenges?: string;
  lessons?: string;
  
  // İleriye Dönük Planlar
  futureGoals?: string;
  businessIdeas?: string;
  investmentInterest?: boolean;
  collaborationAreas?: string;
  
  // İletişim Bilgileri
  phone?: string;
  email?: string;
  description?: string;
  
  // Backward compatibility with existing Contact fields
  first_name?: string;
  last_name?: string;
  profession?: string;
  relationship_degree?: number;
  tags?: string[];
  parent_contact_id?: string;
};

export type Link = {
  id: string;
  source: string;
  target: string;
  strength?: number;
  // Backward compatibility
  relationship_degree?: number;
};

export type NetworkFilters = {
  categories: ("work" | "family" | "friend" | "other")[];
  closenessRange: [number, number];
  searchTerm: string;
};

export type NetworkState = {
  people: Person[];
  links: Link[];
  selectedPersonId: string | null;
  filters: NetworkFilters;
  timelineDate: string | null;
  mode2d3d: "2d" | "3d";
  focusMode: boolean;
};
