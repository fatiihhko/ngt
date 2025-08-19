import { supabase } from "@/integrations/supabase/client";
import type { Person, Link, Contact } from "@/components/network/types";

export interface NetworkRepository {
  getPeople(): Promise<Person[]>;
  getLinks(): Promise<Link[]>;
  addPerson(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person>;
  updatePerson(id: string, updates: Partial<Person>): Promise<Person>;
  removePerson(id: string): Promise<void>;
  addLink(link: Omit<Link, 'id'>): Promise<Link>;
  removeLink(id: string): Promise<void>;
  seedNetwork(): Promise<void>;
}

// Utility functions for data transformation
const contactToPerson = (contact: Contact): Person => ({
  id: contact.id,
  name: `${contact.first_name} ${contact.last_name}`,
  handle: contact.handle || undefined,
  avatarUrl: contact.avatar_url || undefined,
  role: contact.profession || undefined,
  city: contact.city || undefined,
  category: contact.category || "other",
  closeness: (contact.relationship_degree || 5) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
  createdAt: contact.created_at || new Date().toISOString(),
  
  // Temel Bilgiler
  age: contact.age || undefined,
  birthCity: contact.birth_city || undefined,
  currentCity: contact.current_city || undefined,
  education: {
    school: contact.education_school || undefined,
    department: contact.education_department || undefined,
    degree: contact.education_degree || undefined,
    graduationYear: contact.education_graduation_year || undefined,
  },
  
  // İş ve Profesyonel Bilgiler
  company: contact.company || undefined,
  sectors: contact.sectors || [],
  customSector: contact.custom_sector || undefined,
  workExperience: contact.work_experience || undefined,
  expertise: contact.expertise || [],
  customExpertise: contact.custom_expertise || undefined,
  services: contact.services || [],
  customService: contact.custom_service || undefined,
  investments: contact.investments || undefined,
  
  // Kişisel Özellikler
  personalTraits: contact.personal_traits || [],
  values: contact.values || [],
  goals: contact.goals || undefined,
  vision: contact.vision || undefined,
  
  // Sosyal ve Networking
  interests: contact.interests ? (typeof contact.interests === 'string' ? contact.interests.split(',').map(s => s.trim()).filter(Boolean) : []) : [],
  customInterest: contact.custom_interest || undefined,
  languages: contact.languages || [],
  customLanguage: contact.custom_language || undefined,
  isMentor: contact.is_mentor || false,
  volunteerWork: contact.volunteer_work || undefined,
  
  // Kritik Yaşam Deneyimleri
  turningPoints: contact.turning_points || undefined,
  challenges: contact.challenges || undefined,
  lessons: contact.lessons || undefined,
  
  // İleriye Dönük Planlar
  futureGoals: contact.future_goals || undefined,
  businessIdeas: contact.business_ideas || undefined,
  investmentInterest: contact.investment_interest || false,
  collaborationAreas: contact.collaboration_areas || undefined,
  
  // İletişim Bilgileri
  phone: contact.phone || undefined,
  email: contact.email || undefined,
  description: contact.description || undefined,
  
  // Backward compatibility
  first_name: contact.first_name,
  last_name: contact.last_name,
  profession: contact.profession,
  relationship_degree: contact.relationship_degree,
  tags: contact.tags,
  parent_contact_id: contact.parent_contact_id,
});

const personToContact = (person: Person): Omit<Contact, 'id'> => ({
  first_name: person.first_name || person.name.split(' ')[0] || '',
  last_name: person.last_name || person.name.split(' ').slice(1).join(' ') || '',
  city: person.city || null,
  profession: person.role || null,
  relationship_degree: person.closeness || 5,
  tags: person.tags || [],
  phone: person.phone || null,
  email: person.email || null,
  description: person.description || null,
  parent_contact_id: person.parent_contact_id || null,
  avatar_url: person.avatarUrl || null,
  handle: person.handle || null,
  category: person.category || "other",
  
  // Temel Bilgiler
  age: person.age || null,
  birth_city: person.birthCity || null,
  current_city: person.currentCity || null,
  education_school: person.education?.school || null,
  education_department: person.education?.department || null,
  education_degree: person.education?.degree || null,
  education_graduation_year: person.education?.graduationYear || null,
  
  // İş ve Profesyonel Bilgiler
  company: person.company || null,
  sectors: person.sectors || [],
  custom_sector: person.customSector || null,
  work_experience: person.workExperience || null,
  expertise: person.expertise || [],
  custom_expertise: person.customExpertise || null,
  services: person.services || [],
  custom_service: person.customService || null,
  investments: person.investments || null,
  
  // Kişisel Özellikler
  personal_traits: person.personalTraits || [],
  values: person.values || [],
  goals: person.goals || null,
  vision: person.vision || null,
  
  // Sosyal ve Networking
  interests: person.interests ? person.interests.join(', ') : null,
  custom_interest: person.customInterest || null,
  languages: person.languages || [],
  custom_language: person.customLanguage || null,
  is_mentor: person.isMentor || false,
  volunteer_work: person.volunteerWork || null,
  
  // Kritik Yaşam Deneyimleri
  turning_points: person.turningPoints || null,
  challenges: person.challenges || null,
  lessons: person.lessons || null,
  
  // İleriye Dönük Planlar
  future_goals: person.futureGoals || null,
  business_ideas: person.businessIdeas || null,
  investment_interest: person.investmentInterest || false,
  collaboration_areas: person.collaborationAreas || null,
});

// Supabase implementation
export class SupabaseNetworkRepository implements NetworkRepository {
  async getPeople(): Promise<Person[]> {
    try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching people:", error);
        // Return empty array instead of throwing error
      return [];
    }

    return (data || []).map(contactToPerson);
    } catch (error) {
      console.error("Unexpected error fetching people:", error);
      return [];
    }
  }

  async getLinks(): Promise<Link[]> {
    const { data, error } = await supabase
      .from("contacts")
      .select("id, parent_contact_id, relationship_degree")
      .not("parent_contact_id", "is", null);

    if (error) {
      console.error("Error fetching links:", error);
      return [];
    }

    return (data || []).map(contact => ({
      id: `link-${contact.id}`,
      source: contact.parent_contact_id!,
      target: contact.id,
      strength: contact.relationship_degree / 10,
      relationship_degree: contact.relationship_degree,
    }));
  }

  async addPerson(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
    try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const contactData = personToContact(person as Person);
    
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        ...contactData,
        user_id: user.id,
      })
      .select()
      .single();

      if (error) {
        console.error("Database error adding person:", error);
        throw new Error(`Failed to add person: ${error.message}`);
      }
      
    return contactToPerson(data);
    } catch (error) {
      console.error("Error in addPerson:", error);
      throw error;
    }
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const contactUpdates: Partial<Contact> = {};
    
    if (updates.name) {
      const [firstName, ...lastNameParts] = updates.name.split(' ');
      contactUpdates.first_name = firstName;
      contactUpdates.last_name = lastNameParts.join(' ') || '';
    }
    if (updates.role) contactUpdates.profession = updates.role;
    if (updates.city) contactUpdates.city = updates.city;
    if (updates.category) contactUpdates.category = updates.category;
    if (updates.closeness) contactUpdates.relationship_degree = updates.closeness;
    if (updates.avatarUrl) contactUpdates.avatar_url = updates.avatarUrl;
    if (updates.handle) contactUpdates.handle = updates.handle;
    if (updates.services) contactUpdates.services = updates.services;
    if (updates.tags) contactUpdates.tags = updates.tags;
    if (updates.phone) contactUpdates.phone = updates.phone;
    if (updates.email) contactUpdates.email = updates.email;
    if (updates.description) contactUpdates.description = updates.description;

    // Temel Bilgiler
    if (updates.age !== undefined) contactUpdates.age = updates.age;
    if (updates.birthCity !== undefined) contactUpdates.birth_city = updates.birthCity;
    if (updates.currentCity !== undefined) contactUpdates.current_city = updates.currentCity;
    if (updates.education?.school !== undefined) contactUpdates.education_school = updates.education.school;
    if (updates.education?.department !== undefined) contactUpdates.education_department = updates.education.department;
    if (updates.education?.degree !== undefined) contactUpdates.education_degree = updates.education.degree;
    if (updates.education?.graduationYear !== undefined) contactUpdates.education_graduation_year = updates.education.graduationYear;

    // İş ve Profesyonel Bilgiler
    if (updates.company !== undefined) contactUpdates.company = updates.company;
    if (updates.sectors !== undefined) contactUpdates.sectors = updates.sectors;
    if (updates.customSector !== undefined) contactUpdates.custom_sector = updates.customSector;
    if (updates.workExperience !== undefined) contactUpdates.work_experience = updates.workExperience;
    if (updates.expertise !== undefined) contactUpdates.expertise = updates.expertise;
    if (updates.customExpertise !== undefined) contactUpdates.custom_expertise = updates.customExpertise;
    if (updates.services !== undefined) contactUpdates.services = updates.services;
    if (updates.customService !== undefined) contactUpdates.custom_service = updates.customService;
    if (updates.investments !== undefined) contactUpdates.investments = updates.investments;

    // Kişisel Özellikler
    if (updates.personalTraits !== undefined) contactUpdates.personal_traits = updates.personalTraits;
    if (updates.values !== undefined) contactUpdates.values = updates.values;
    if (updates.goals !== undefined) contactUpdates.goals = updates.goals;
    if (updates.vision !== undefined) contactUpdates.vision = updates.vision;

    // Sosyal ve Networking
    if (updates.interests !== undefined) contactUpdates.interests = updates.interests ? updates.interests.join(', ') : null;
    if (updates.customInterest !== undefined) contactUpdates.custom_interest = updates.customInterest;
    if (updates.languages !== undefined) contactUpdates.languages = updates.languages;
    if (updates.customLanguage !== undefined) contactUpdates.custom_language = updates.customLanguage;
    if (updates.isMentor !== undefined) contactUpdates.is_mentor = updates.isMentor;
    if (updates.volunteerWork !== undefined) contactUpdates.volunteer_work = updates.volunteerWork;

    // Kritik Yaşam Deneyimleri
    if (updates.turningPoints !== undefined) contactUpdates.turning_points = updates.turningPoints;
    if (updates.challenges !== undefined) contactUpdates.challenges = updates.challenges;
    if (updates.lessons !== undefined) contactUpdates.lessons = updates.lessons;

    // İleriye Dönük Planlar
    if (updates.futureGoals !== undefined) contactUpdates.future_goals = updates.futureGoals;
    if (updates.businessIdeas !== undefined) contactUpdates.business_ideas = updates.businessIdeas;
    if (updates.investmentInterest !== undefined) contactUpdates.investment_interest = updates.investmentInterest;
    if (updates.collaborationAreas !== undefined) contactUpdates.collaboration_areas = updates.collaborationAreas;

    const { data, error } = await supabase
      .from("contacts")
      .update(contactUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return contactToPerson(data);
  }

  async removePerson(id: string): Promise<void> {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async addLink(link: Omit<Link, 'id'>): Promise<Link> {
    // In Supabase, links are represented by parent_contact_id
    // We need to update the target contact to point to the source
    const { error } = await supabase
      .from("contacts")
      .update({ parent_contact_id: link.source })
      .eq("id", link.target);

    if (error) throw error;

    return {
      id: `link-${link.target}`,
      source: link.source,
      target: link.target,
      strength: link.strength || 0.5,
    };
  }

  async removeLink(id: string): Promise<void> {
    // Extract target contact ID from link ID
    const targetId = id.replace('link-', '');
    
    const { error } = await supabase
      .from("contacts")
      .update({ parent_contact_id: null })
      .eq("id", targetId);

    if (error) throw error;
  }

  async seedNetwork(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const seedPeople = [
      // Teknoloji Sektörü
      {
        name: "Ahmet Yılmaz",
        role: "Senior Software Engineer",
        category: "work" as const,
        closeness: 8 as const,
        city: "İstanbul",
        company: "TechCorp",
        age: "32",
        birthCity: "Ankara",
        currentCity: "İstanbul",
        educationSchool: "ODTÜ",
        educationDepartment: "Bilgisayar Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl yazılım geliştirme deneyimi, React, Node.js, Python uzmanı",
        sectors: ["Teknoloji", "Fintech"],
        expertise: ["Frontend", "Backend", "DevOps"],
        services: ["Yazılım Geliştirme", "Sistem Tasarımı"],
        personalTraits: ["Liderlik", "Takım Çalışması", "Problem Çözme"],
        values: ["Kalite", "İnovasyon", "Sürekli Öğrenme"],
        goals: "Teknoloji lideri olmak ve startup kurmak",
        vision: "Türkiye'de teknoloji ekosistemini geliştirmek",
        interests: ["Yapay zeka", "blockchain", "açık kaynak projeler"],
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Kod yazma kampları düzenleme",
        turningPoints: "Yurtdışında çalışma deneyimi, startup kurma kararı",
        challenges: "Büyük ölçekli sistemlerde performans optimizasyonu",
        lessons: "Takım çalışmasının önemi ve sürekli öğrenmenin değeri",
        futureGoals: "Kendi teknoloji şirketini kurmak",
        businessIdeas: "AI tabanlı eğitim platformu",
        investmentInterest: true,
        collaborationAreas: "Yapay zeka, blockchain, eğitim teknolojileri"
      },
      {
        name: "Zeynep Kaya",
        role: "UX/UI Designer",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "DesignStudio",
        age: "28",
        birthCity: "İzmir",
        currentCity: "İstanbul",
        educationSchool: "İTÜ",
        educationDepartment: "Endüstriyel Tasarım",
        educationDegree: "Lisans",
        workExperience: "5 yıl kullanıcı deneyimi tasarımı, mobil ve web uygulamaları",
        sectors: ["Teknoloji", "E-ticaret"],
        expertise: ["UI/UX", "Prototyping", "User Research"],
        services: ["Tasarım", "Kullanıcı Araştırması"],
        personalTraits: ["Yaratıcılık", "Empati", "Detay Odaklı"],
        values: ["Kullanıcı Odaklılık", "Estetik", "Fonksiyonellik"],
        goals: "Dünya çapında tanınan bir tasarımcı olmak",
        vision: "Türkiye'de tasarım kültürünü geliştirmek",
        interests: ["Sanat", "psikoloji", "teknoloji trendleri"],
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Sosyal sorumluluk projelerinde tasarım desteği",
        turningPoints: "UX tasarımına geçiş kararı",
        challenges: "Karmaşık sistemlerde kullanıcı deneyimi optimizasyonu",
        lessons: "Kullanıcı geri bildiriminin önemi",
        futureGoals: "Kendi tasarım ajansını kurmak",
        businessIdeas: "Tasarım eğitimi platformu",
        investmentInterest: false,
        collaborationAreas: "E-ticaret, fintech, eğitim"
      },
      {
        name: "Mehmet Demir",
        role: "Product Manager",
        category: "work" as const,
        closeness: 9 as const,
        city: "İstanbul",
        company: "StartupHub",
        age: "35",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "Boğaziçi Üniversitesi",
        educationDepartment: "İşletme",
        educationDegree: "MBA",
        workExperience: "10 yıl ürün yönetimi, 3 startup deneyimi",
        sectors: ["Teknoloji", "Fintech", "E-ticaret"],
        expertise: ["Ürün Stratejisi", "Agile", "Analytics"],
        services: ["Ürün Danışmanlığı", "Strateji"],
        personalTraits: ["Liderlik", "Analitik Düşünme", "İletişim"],
        values: ["Müşteri Odaklılık", "Veri Odaklılık", "İnovasyon"],
        goals: "Başarılı bir startup kurmak",
        vision: "Türkiye'de teknoloji ekosistemini büyütmek",
        interests: "Startup ekosistemi, yatırım, teknoloji trendleri",
        languages: ["Türkçe", "İngilizce", "İspanyolca"],
        isMentor: true,
        volunteerWork: "Startup mentorluğu",
        turningPoints: "İlk startup deneyimi, MBA eğitimi",
        challenges: "Pazar rekabeti ve kaynak yönetimi",
        lessons: "Müşteri ihtiyaçlarını anlamanın önemi",
        futureGoals: "Kendi fintech startup'ını kurmak",
        businessIdeas: "Dijital bankacılık çözümü",
        investmentInterest: true,
        collaborationAreas: "Fintech, e-ticaret, sağlık teknolojileri"
      },
      {
        name: "Ayşe Özkan",
        role: "Data Scientist",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "DataLab",
        age: "30",
        birthCity: "Bursa",
        currentCity: "Ankara",
        educationSchool: "Hacettepe Üniversitesi",
        educationDepartment: "İstatistik",
        educationDegree: "Doktora",
        workExperience: "6 yıl veri bilimi, makine öğrenmesi uzmanı",
        sectors: ["Teknoloji", "Sağlık", "Finans"],
        expertise: ["Machine Learning", "Python", "R", "SQL"],
        services: ["Veri Analizi", "AI Modelleme"],
        personalTraits: ["Analitik Düşünme", "Merak", "Sabır"],
        values: ["Bilimsel Yaklaşım", "Doğruluk", "Sürekli Öğrenme"],
        goals: "AI alanında uzmanlaşmak",
        vision: "Veri bilimini Türkiye'de yaygınlaştırmak",
        interests: "Yapay zeka, istatistik, araştırma",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: true,
        volunteerWork: "Veri bilimi eğitimi",
        turningPoints: "Doktora eğitimi, yurtdışı araştırma deneyimi",
        challenges: "Karmaşık veri setlerinde anlamlı sonuçlar çıkarma",
        lessons: "Veri kalitesinin önemi",
        futureGoals: "AI araştırma laboratuvarı kurmak",
        businessIdeas: "AI tabanlı sağlık teşhis sistemi",
        investmentInterest: false,
        collaborationAreas: "Sağlık teknolojileri, fintech, eğitim"
      },
      {
        name: "Can Arslan",
        role: "DevOps Engineer",
        category: "work" as const,
        closeness: 5 as const,
        city: "İzmir",
        company: "CloudTech",
        age: "29",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Bilgisayar Mühendisliği",
        educationDegree: "Lisans",
        workExperience: "7 yıl DevOps, cloud computing deneyimi",
        sectors: ["Teknoloji", "Cloud Computing"],
        expertise: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        services: ["DevOps Danışmanlığı", "Cloud Migration"],
        personalTraits: ["Sistem Düşüncesi", "Otomasyon Odaklı", "Problem Çözme"],
        values: ["Güvenilirlik", "Otomasyon", "Sürekli İyileştirme"],
        goals: "Cloud architecture uzmanı olmak",
        vision: "Türkiye'de cloud teknolojilerini yaygınlaştırmak",
        interests: "Cloud teknolojileri, otomasyon, sistem tasarımı",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Açık kaynak projelere katkı",
        turningPoints: "DevOps alanına geçiş",
        challenges: "Büyük ölçekli sistemlerde güvenlik",
        lessons: "Otomasyonun değeri ve güvenliğin önemi",
        futureGoals: "Cloud consulting şirketi kurmak",
        businessIdeas: "Cloud güvenlik çözümü",
        investmentInterest: true,
        collaborationAreas: "Cloud computing, güvenlik, IoT"
      },
      // Pazarlama ve İletişim Sektörü
      {
        name: "Elif Çetin",
        role: "Marketing Manager",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "BrandWorks",
        age: "31",
        birthCity: "Antalya",
        currentCity: "İstanbul",
        educationSchool: "Marmara Üniversitesi",
        educationDepartment: "İletişim",
        educationDegree: "Lisans",
        workExperience: "8 yıl dijital pazarlama, marka yönetimi",
        sectors: ["Pazarlama", "E-ticaret", "Medya"],
        expertise: ["Digital Marketing", "Brand Strategy", "Social Media"],
        services: ["Pazarlama Stratejisi", "Marka Danışmanlığı"],
        personalTraits: ["Yaratıcılık", "İletişim", "Stratejik Düşünme"],
        values: ["Marka Değeri", "Müşteri Memnuniyeti", "İnovasyon"],
        goals: "Global markalar için çalışmak",
        vision: "Türk markalarını dünya çapında tanıtmak",
        interests: "Sosyal medya, influencer marketing, trend analizi",
        languages: ["Türkçe", "İngilizce", "İtalyanca"],
        isMentor: true,
        volunteerWork: "Kadın girişimcilere mentorluk",
        turningPoints: "Yurtdışında çalışma deneyimi",
        challenges: "Pazar rekabeti ve ROI optimizasyonu",
        lessons: "Veri odaklı pazarlamanın önemi",
        futureGoals: "Kendi pazarlama ajansını kurmak",
        businessIdeas: "Influencer marketing platformu",
        investmentInterest: true,
        collaborationAreas: "E-ticaret, fintech, sağlık"
      },
      {
        name: "Burak Yıldız",
        role: "Content Creator",
        category: "work" as const,
        closeness: 4 as const,
        city: "İstanbul",
        company: "ContentHub",
        age: "26",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Gazetecilik",
        educationDegree: "Lisans",
        workExperience: "4 yıl içerik üretimi, sosyal medya yönetimi",
        sectors: ["Medya", "Eğlence", "E-ticaret"],
        expertise: ["Video Production", "Social Media", "Storytelling"],
        services: ["İçerik Üretimi", "Sosyal Medya Yönetimi"],
        personalTraits: ["Yaratıcılık", "İletişim", "Adaptasyon"],
        values: ["Orijinallik", "Eğlence", "Eğitim"],
        goals: "Milyonlarca takipçiye ulaşmak",
        vision: "Türkiye'de kaliteli içerik üretimini artırmak",
        interests: "Video düzenleme, fotoğrafçılık, seyahat",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Gençlere içerik üretimi eğitimi",
        turningPoints: "YouTube kanalı başlatma",
        challenges: "Sürekli içerik üretimi ve algoritma değişiklikleri",
        lessons: "Tutarlılığın ve kalitenin önemi",
        futureGoals: "Kendi medya şirketini kurmak",
        businessIdeas: "Eğitim içerik platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim, e-ticaret, turizm"
      },
      // Finans Sektörü
      {
        name: "Selin Korkmaz",
        role: "Financial Analyst",
        category: "work" as const,
        closeness: 6 as const,
        city: "İstanbul",
        company: "FinanceCorp",
        age: "33",
        birthCity: "İzmir",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Teknik Üniversitesi",
        educationDepartment: "Endüstri Mühendisliği",
        educationDegree: "Master",
        workExperience: "9 yıl finansal analiz, yatırım danışmanlığı",
        sectors: ["Finans", "Yatırım", "Bankacılık"],
        expertise: ["Financial Modeling", "Excel", "Risk Analysis"],
        services: ["Finansal Analiz", "Yatırım Danışmanlığı"],
        personalTraits: ["Analitik Düşünme", "Detay Odaklı", "Güvenilirlik"],
        values: ["Şeffaflık", "Güvenilirlik", "Sürdürülebilirlik"],
        goals: "Portföy yöneticisi olmak",
        vision: "Finansal okuryazarlığı artırmak",
        interests: "Ekonomi, yatırım, sürdürülebilir finans",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Finansal okuryazarlık eğitimi",
        turningPoints: "CFA sertifikası alma",
        challenges: "Piyasa volatilitesi ve risk yönetimi",
        lessons: "Diversifikasyonun önemi",
        futureGoals: "Kendi yatırım fonunu kurmak",
        businessIdeas: "Sürdürülebilir yatırım platformu",
        investmentInterest: true,
        collaborationAreas: "Fintech, sürdürülebilir yatırım, eğitim"
      },
      {
        name: "Deniz Aydın",
        role: "Accountant",
        category: "work" as const,
        closeness: 5 as const,
        city: "Ankara",
        company: "TaxOffice",
        age: "35",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Gazi Üniversitesi",
        educationDepartment: "Muhasebe",
        educationDegree: "Lisans",
        workExperience: "12 yıl muhasebe, vergi danışmanlığı",
        sectors: ["Muhasebe", "Vergi", "Danışmanlık"],
        expertise: ["Tax Planning", "Financial Reporting", "Audit"],
        services: ["Muhasebe", "Vergi Danışmanlığı"],
        personalTraits: ["Düzenlilik", "Güvenilirlik", "Detay Odaklı"],
        values: ["Doğruluk", "Güvenilirlik", "Profesyonellik"],
        goals: "Kendi muhasebe ofisini kurmak",
        vision: "Küçük işletmelere kaliteli muhasebe hizmeti",
        interests: "Vergi mevzuatı, finansal planlama, iş geliştirme",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Küçük işletmelere ücretsiz danışmanlık",
        turningPoints: "Kendi ofisini açma kararı",
        challenges: "Sürekli değişen vergi mevzuatı",
        lessons: "Sürekli güncel kalmanın önemi",
        futureGoals: "Büyük bir muhasebe şirketi kurmak",
        businessIdeas: "Dijital muhasebe platformu",
        investmentInterest: false,
        collaborationAreas: "Fintech, e-ticaret, danışmanlık"
      },
      // Sağlık Sektörü
      {
        name: "Dr. Emre Şahin",
        role: "Medical Advisor",
        category: "work" as const,
        closeness: 8 as const,
        city: "İstanbul",
        company: "HealthTech",
        age: "38",
        birthCity: "Bursa",
        currentCity: "İstanbul",
        educationSchool: "Hacettepe Üniversitesi",
        educationDepartment: "Tıp",
        educationDegree: "Uzmanlık",
        workExperience: "15 yıl tıp deneyimi, 5 yıl sağlık teknolojileri",
        sectors: ["Sağlık", "Teknoloji", "Biyoteknoloji"],
        expertise: ["Telemedicine", "Health Tech", "Clinical Research"],
        services: ["Tıbbi Danışmanlık", "Sağlık Teknolojileri"],
        personalTraits: ["Empati", "Analitik Düşünme", "Liderlik"],
        values: ["Hasta Güvenliği", "Bilimsel Yaklaşım", "İnovasyon"],
        goals: "Sağlık teknolojilerinde öncü olmak",
        vision: "Sağlık hizmetlerini teknoloji ile iyileştirmek",
        interests: "Yapay zeka, telemedicine, klinik araştırmalar",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Sağlık taramaları ve eğitim",
        turningPoints: "Sağlık teknolojilerine geçiş",
        challenges: "Teknoloji ve tıbbı entegre etme",
        lessons: "Hasta odaklı yaklaşımın önemi",
        futureGoals: "Sağlık teknolojileri startup'ı kurmak",
        businessIdeas: "AI tabanlı teşhis sistemi",
        investmentInterest: true,
        collaborationAreas: "Sağlık teknolojileri, telemedicine, biyoteknoloji"
      },
      // Eğitim Sektörü
      {
        name: "Fatma Özkan",
        role: "Educational Content Creator",
        category: "work" as const,
        closeness: 6 as const,
        city: "İzmir",
        company: "EduTech",
        age: "29",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Eğitim Bilimleri",
        educationDegree: "Master",
        workExperience: "7 yıl eğitim içeriği üretimi, online eğitim",
        sectors: ["Eğitim", "Teknoloji", "Medya"],
        expertise: ["Curriculum Design", "Online Learning", "EdTech"],
        services: ["Eğitim İçeriği", "Öğretim Tasarımı"],
        personalTraits: ["Sabır", "Yaratıcılık", "İletişim"],
        values: ["Eğitim", "Erişilebilirlik", "Kalite"],
        goals: "Eğitim teknolojilerinde uzmanlaşmak",
        vision: "Kaliteli eğitimi herkese ulaştırmak",
        interests: "Eğitim teknolojileri, psikoloji, yaratıcı yazarlık",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: true,
        volunteerWork: "Köy okullarına eğitim desteği",
        turningPoints: "Online eğitime geçiş",
        challenges: "Farklı öğrenme stillerine uyum sağlama",
        lessons: "Kişiselleştirilmiş eğitimin önemi",
        futureGoals: "Kendi eğitim platformunu kurmak",
        businessIdeas: "Kişiselleştirilmiş öğrenme platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim teknolojileri, online eğitim, özel eğitim"
      },
      // Hukuk Sektörü
      {
        name: "Av. Mert Kaya",
        role: "Legal Counsel",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "LawFirm",
        age: "34",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Hukuk",
        educationDegree: "Lisans",
        workExperience: "10 yıl hukuk deneyimi, teknoloji hukuku uzmanı",
        sectors: ["Hukuk", "Teknoloji", "Finans"],
        expertise: ["Technology Law", "IP Law", "Contract Law"],
        services: ["Hukuki Danışmanlık", "Sözleşme Hazırlama"],
        personalTraits: ["Analitik Düşünme", "Güvenilirlik", "Detay Odaklı"],
        values: ["Adalet", "Güvenilirlik", "Profesyonellik"],
        goals: "Teknoloji hukukunda uzmanlaşmak",
        vision: "Teknoloji şirketlerine hukuki güvenlik sağlamak",
        interests: "Teknoloji hukuku, fikri mülkiyet, startup ekosistemi",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Startup'lara ücretsiz hukuki danışmanlık",
        turningPoints: "Teknoloji hukukuna odaklanma",
        challenges: "Hızlı değişen teknoloji ve mevzuat",
        lessons: "Sürekli güncel kalmanın önemi",
        futureGoals: "Kendi hukuk bürosunu kurmak",
        businessIdeas: "Legal tech platformu",
        investmentInterest: true,
        collaborationAreas: "Fintech, sağlık teknolojileri, e-ticaret"
      },
      // İnsan Kaynakları
      {
        name: "Gizem Demir",
        role: "HR Manager",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "TalentCorp",
        age: "32",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Orta Doğu Teknik Üniversitesi",
        educationDepartment: "Endüstri Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl insan kaynakları, talent acquisition",
        sectors: ["İnsan Kaynakları", "Teknoloji", "Danışmanlık"],
        expertise: ["Talent Acquisition", "Employee Relations", "HR Tech"],
        services: ["İK Danışmanlığı", "Yetenek Yönetimi"],
        personalTraits: ["İletişim", "Empati", "Organizasyon"],
        values: ["İnsan Odaklılık", "Adalet", "Gelişim"],
        goals: "İK teknolojilerinde uzmanlaşmak",
        vision: "Çalışan deneyimini iyileştirmek",
        interests: "Organizasyonel psikoloji, HR teknolojileri, kültür",
        languages: ["Türkçe", "İngilizce", "İspanyolca"],
        isMentor: true,
        volunteerWork: "Kariyer danışmanlığı",
        turningPoints: "İK alanına geçiş",
        challenges: "Yetenek savaşı ve kültür uyumu",
        lessons: "İnsan faktörünün önemi",
        futureGoals: "Kendi İK danışmanlık şirketini kurmak",
        businessIdeas: "HR tech platformu",
        investmentInterest: false,
        collaborationAreas: "Teknoloji, fintech, e-ticaret"
      },
      // Gayrimenkul
      {
        name: "Serkan Yılmaz",
        role: "Real Estate Specialist",
        category: "work" as const,
        closeness: 5 as const,
        city: "İstanbul",
        company: "PropertyCorp",
        age: "36",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "İşletme",
        educationDegree: "Lisans",
        workExperience: "12 yıl gayrimenkul, yatırım danışmanlığı",
        sectors: ["Gayrimenkul", "Yatırım", "Danışmanlık"],
        expertise: ["Property Investment", "Market Analysis", "Negotiation"],
        services: ["Gayrimenkul Danışmanlığı", "Yatırım Analizi"],
        personalTraits: ["İletişim", "Pazarlık", "Analitik Düşünme"],
        values: ["Güvenilirlik", "Müşteri Memnuniyeti", "Sürdürülebilirlik"],
        goals: "Büyük ölçekli projelerde uzmanlaşmak",
        vision: "Sürdürülebilir gayrimenkul geliştirme",
        interests: "Pazar analizi, sürdürülebilir yapılar, yatırım",
        languages: ["Türkçe", "İngilizce", "Arapça"],
        isMentor: false,
        volunteerWork: "Sosyal konut projeleri",
        turningPoints: "Yatırım odaklı gayrimenkul",
        challenges: "Pazar volatilitesi ve regülasyonlar",
        lessons: "Uzun vadeli düşünmenin önemi",
        futureGoals: "Kendi gayrimenkul şirketini kurmak",
        businessIdeas: "Proptech platformu",
        investmentInterest: true,
        collaborationAreas: "Proptech, fintech, sürdürülebilir yapılar"
      },
      // Lojistik
      {
        name: "Hakan Özkan",
        role: "Logistics Manager",
        category: "work" as const,
        closeness: 4 as const,
        city: "İzmir",
        company: "LogiTech",
        age: "40",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Dokuz Eylül Üniversitesi",
        educationDepartment: "Lojistik Yönetimi",
        educationDegree: "Lisans",
        workExperience: "15 yıl lojistik, tedarik zinciri yönetimi",
        sectors: ["Lojistik", "E-ticaret", "Üretim"],
        expertise: ["Supply Chain", "Warehouse Management", "Transportation"],
        services: ["Lojistik Danışmanlığı", "Tedarik Zinciri Optimizasyonu"],
        personalTraits: ["Organizasyon", "Problem Çözme", "Liderlik"],
        values: ["Verimlilik", "Güvenilirlik", "Sürdürülebilirlik"],
        goals: "Sürdürülebilir lojistik çözümleri geliştirmek",
        vision: "Türkiye'de lojistik sektörünü modernleştirmek",
        interests: ["Sürdürülebilir lojistik", "teknoloji", "optimizasyon"],
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Afet lojistiği",
        turningPoints: "Sürdürülebilir lojistiğe odaklanma",
        challenges: "Maliyet optimizasyonu ve çevre dostu çözümler",
        lessons: "Sürdürülebilirliğin uzun vadeli faydaları",
        futureGoals: "Kendi lojistik şirketini kurmak",
        businessIdeas: "Yeşil lojistik platformu",
        investmentInterest: true,
        collaborationAreas: "E-ticaret, sürdürülebilir lojistik, IoT"
      },
      // Enerji
      {
        name: "Merve Arslan",
        role: "Energy Consultant",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "GreenEnergy",
        age: "31",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Orta Doğu Teknik Üniversitesi",
        educationDepartment: "Enerji Sistemleri Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl enerji danışmanlığı, yenilenebilir enerji",
        sectors: ["Enerji", "Sürdürülebilirlik", "Teknoloji"],
        expertise: ["Renewable Energy", "Energy Efficiency", "Sustainability"],
        services: ["Enerji Danışmanlığı", "Sürdürülebilirlik"],
        personalTraits: ["Analitik Düşünme", "Sürdürülebilirlik Odaklı", "İnovasyon"],
        values: ["Sürdürülebilirlik", "Çevre Bilinci", "İnovasyon"],
        goals: "Temiz enerji çözümleri geliştirmek",
        vision: "Türkiye'de yenilenebilir enerjiyi yaygınlaştırmak",
        interests: "Yenilenebilir enerji, sürdürülebilirlik, teknoloji",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Çevre eğitimi ve farkındalık",
        turningPoints: "Yenilenebilir enerji alanına geçiş",
        challenges: "Fosil yakıt bağımlılığından kurtulma",
        lessons: "Sürdürülebilir çözümlerin uzun vadeli faydaları",
        futureGoals: "Kendi temiz enerji şirketini kurmak",
        businessIdeas: "Enerji verimliliği platformu",
        investmentInterest: true,
        collaborationAreas: "Yenilenebilir enerji, teknoloji, sürdürülebilirlik"
      },
      // Çevre
      {
        name: "Ece Yıldız",
        role: "Environmental Specialist",
        category: "work" as const,
        closeness: 5 as const,
        city: "İzmir",
        company: "EcoTech",
        age: "28",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Çevre Mühendisliği",
        educationDegree: "Lisans",
        workExperience: "5 yıl çevre danışmanlığı, sürdürülebilirlik",
        sectors: ["Çevre", "Sürdürülebilirlik", "Danışmanlık"],
        expertise: ["Environmental Assessment", "Sustainability", "Waste Management"],
        services: ["Çevre Danışmanlığı", "Sürdürülebilirlik"],
        personalTraits: ["Çevre Bilinci", "Analitik Düşünme", "Problem Çözme"],
        values: ["Sürdürülebilirlik", "Çevre Koruma", "Toplumsal Fayda"],
        goals: "Çevre teknolojilerinde uzmanlaşmak",
        vision: "Sürdürülebilir bir gelecek için çalışmak",
        interests: "Çevre teknolojileri, sürdürülebilirlik, eğitim",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: false,
        volunteerWork: "Çevre eğitimi ve temizlik kampanyaları",
        turningPoints: "Çevre mühendisliği eğitimi",
        challenges: "Çevre bilinci oluşturma ve uygulama",
        lessons: "Küçük değişikliklerin büyük etkileri",
        futureGoals: "Kendi çevre danışmanlık şirketini kurmak",
        businessIdeas: "Sürdürülebilirlik platformu",
        investmentInterest: false,
        collaborationAreas: "Sürdürülebilirlik, teknoloji, eğitim"
      },
      // Medya
      {
        name: "Kaan Demir",
        role: "Media Producer",
        category: "work" as const,
        closeness: 4 as const,
        city: "İstanbul",
        company: "MediaCorp",
        age: "27",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Radyo, Televizyon ve Sinema",
        educationDegree: "Lisans",
        workExperience: "6 yıl medya üretimi, video prodüksiyon",
        sectors: ["Medya", "Eğlence", "E-ticaret"],
        expertise: ["Video Production", "Content Creation", "Digital Media"],
        services: ["Video Prodüksiyon", "İçerik Üretimi"],
        personalTraits: ["Yaratıcılık", "Teknik Beceri", "İletişim"],
        values: ["Kalite", "Yaratıcılık", "İnovasyon"],
        goals: "Uluslararası projelerde çalışmak",
        vision: "Türkiye'de kaliteli medya içeriği üretmek",
        interests: "Video düzenleme, sinema, dijital medya",
        languages: ["Türkçe", "İngilizce", "İtalyanca"],
        isMentor: false,
        volunteerWork: "Gençlere medya eğitimi",
        turningPoints: "Dijital medyaya geçiş",
        challenges: "Teknoloji değişikliklerine adaptasyon",
        lessons: "Sürekli öğrenmenin önemi",
        futureGoals: "Kendi prodüksiyon şirketini kurmak",
        businessIdeas: "Dijital medya platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim, e-ticaret, eğlence"
      }
    ];

    // Insert seed people
    for (const person of seedPeople) {
      await this.addPerson({
        ...person,
        email: `${person.name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+90 5${Math.floor(Math.random() * 90000000) + 10000000}`,
        services: person.services || [],
        tags: person.category === "work" ? ["Professional", "Network"] : ["Personal"],
      });
    }

    // Get all people to create links
    const people = await this.getPeople();
    
    // Create comprehensive network links
    const links = [
      // Teknoloji ekosistemi
      { source: people[0].id, target: people[1].id }, // Senior Engineer -> UX Designer
      { source: people[0].id, target: people[2].id }, // Senior Engineer -> Product Manager
      { source: people[0].id, target: people[3].id }, // Senior Engineer -> Data Scientist
      { source: people[0].id, target: people[4].id }, // Senior Engineer -> DevOps Engineer
      
      // Ürün ekibi
      { source: people[2].id, target: people[1].id }, // Product Manager -> UX Designer
      { source: people[2].id, target: people[3].id }, // Product Manager -> Data Scientist
      { source: people[2].id, target: people[5].id }, // Product Manager -> Marketing Manager
      
      // Pazarlama ekibi
      { source: people[5].id, target: people[6].id }, // Marketing Manager -> Content Creator
      { source: people[5].id, target: people[7].id }, // Marketing Manager -> Financial Analyst
      
      // Finans ekibi
      { source: people[7].id, target: people[8].id }, // Financial Analyst -> Accountant
      { source: people[7].id, target: people[9].id }, // Financial Analyst -> Medical Advisor
      
      // Sağlık teknolojileri
      { source: people[9].id, target: people[3].id }, // Medical Advisor -> Data Scientist
      { source: people[9].id, target: people[10].id }, // Medical Advisor -> Educational Content Creator
      
      // Eğitim ekibi
      { source: people[10].id, target: people[11].id }, // Educational Content Creator -> Legal Counsel
      { source: people[10].id, target: people[12].id }, // Educational Content Creator -> HR Manager
      
      // Hukuk ve İK
      { source: people[11].id, target: people[12].id }, // Legal Counsel -> HR Manager
      { source: people[11].id, target: people[13].id }, // Legal Counsel -> Real Estate Specialist
      
      // Gayrimenkul ve lojistik
      { source: people[13].id, target: people[14].id }, // Real Estate Specialist -> Logistics Manager
      { source: people[13].id, target: people[15].id }, // Real Estate Specialist -> Energy Consultant
      
      // Enerji ve çevre
      { source: people[15].id, target: people[16].id }, // Energy Consultant -> Environmental Specialist
      { source: people[15].id, target: people[17].id }, // Energy Consultant -> Media Producer
      
      // Medya ve içerik
      { source: people[17].id, target: people[6].id }, // Media Producer -> Content Creator
      { source: people[17].id, target: people[10].id }, // Media Producer -> Educational Content Creator
      
      // Cross-sector connections
      { source: people[0].id, target: people[5].id }, // Senior Engineer -> Marketing Manager
      { source: people[1].id, target: people[6].id }, // UX Designer -> Content Creator
      { source: people[3].id, target: people[7].id }, // Data Scientist -> Financial Analyst
      { source: people[4].id, target: people[14].id }, // DevOps Engineer -> Logistics Manager
      { source: people[8].id, target: people[11].id }, // Accountant -> Legal Counsel
      { source: people[12].id, target: people[16].id }, // HR Manager -> Environmental Specialist
    ];

    for (const link of links) {
      await this.addLink(link);
    }
  }
}

// Mock implementation for development/testing
export class MockNetworkRepository implements NetworkRepository {
  private people: Person[] = [];
  private links: Link[] = [];

  async getPeople(): Promise<Person[]> {
    return this.people;
  }

  async getLinks(): Promise<Link[]> {
    return this.links;
  }

  async addPerson(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
    };
    this.people.push(newPerson);
    return newPerson;
  }

  async updatePerson(id: string, updates: Partial<Person>): Promise<Person> {
    const index = this.people.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Person not found");
    
    this.people[index] = { ...this.people[index], ...updates };
    return this.people[index];
  }

  async removePerson(id: string): Promise<void> {
    this.people = this.people.filter(p => p.id !== id);
    this.links = this.links.filter(l => l.source !== id && l.target !== id);
  }

  async addLink(link: Omit<Link, 'id'>): Promise<Link> {
    const newLink: Link = {
      ...link,
      id: `link-${Date.now()}-${Math.random()}`,
    };
    this.links.push(newLink);
    return newLink;
  }

  async removeLink(id: string): Promise<void> {
    this.links = this.links.filter(l => l.id !== id);
  }

  async seedNetwork(): Promise<void> {
    // Clear existing data
    this.people = [];
    this.links = [];

    // Add comprehensive seed people
    const seedPeople = [
      // Teknoloji Sektörü
      {
        name: "Ahmet Yılmaz",
        role: "Senior Software Engineer",
        category: "work" as const,
        closeness: 8 as const,
        city: "İstanbul",
        company: "TechCorp",
        age: "32",
        birthCity: "Ankara",
        currentCity: "İstanbul",
        educationSchool: "ODTÜ",
        educationDepartment: "Bilgisayar Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl yazılım geliştirme deneyimi, React, Node.js, Python uzmanı",
        sectors: ["Teknoloji", "Fintech"],
        expertise: ["Frontend", "Backend", "DevOps"],
        services: ["Yazılım Geliştirme", "Sistem Tasarımı"],
        personalTraits: ["Liderlik", "Takım Çalışması", "Problem Çözme"],
        values: ["Kalite", "İnovasyon", "Sürekli Öğrenme"],
        goals: "Teknoloji lideri olmak ve startup kurmak",
        vision: "Türkiye'de teknoloji ekosistemini geliştirmek",
        interests: "Yapay zeka, blockchain, açık kaynak projeler",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Kod yazma kampları düzenleme",
        turningPoints: "Yurtdışında çalışma deneyimi, startup kurma kararı",
        challenges: "Büyük ölçekli sistemlerde performans optimizasyonu",
        lessons: "Takım çalışmasının önemi ve sürekli öğrenmenin değeri",
        futureGoals: "Kendi teknoloji şirketini kurmak",
        businessIdeas: "AI tabanlı eğitim platformu",
        investmentInterest: true,
        collaborationAreas: "Yapay zeka, blockchain, eğitim teknolojileri"
      },
      {
        name: "Zeynep Kaya",
        role: "UX/UI Designer",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "DesignStudio",
        age: "28",
        birthCity: "İzmir",
        currentCity: "İstanbul",
        educationSchool: "İTÜ",
        educationDepartment: "Endüstriyel Tasarım",
        educationDegree: "Lisans",
        workExperience: "5 yıl kullanıcı deneyimi tasarımı, mobil ve web uygulamaları",
        sectors: ["Teknoloji", "E-ticaret"],
        expertise: ["UI/UX", "Prototyping", "User Research"],
        services: ["Tasarım", "Kullanıcı Araştırması"],
        personalTraits: ["Yaratıcılık", "Empati", "Detay Odaklı"],
        values: ["Kullanıcı Odaklılık", "Estetik", "Fonksiyonellik"],
        goals: "Dünya çapında tanınan bir tasarımcı olmak",
        vision: "Türkiye'de tasarım kültürünü geliştirmek",
        interests: "Sanat, psikoloji, teknoloji trendleri",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Sosyal sorumluluk projelerinde tasarım desteği",
        turningPoints: "UX tasarımına geçiş kararı",
        challenges: "Karmaşık sistemlerde kullanıcı deneyimi optimizasyonu",
        lessons: "Kullanıcı geri bildiriminin önemi",
        futureGoals: "Kendi tasarım ajansını kurmak",
        businessIdeas: "Tasarım eğitimi platformu",
        investmentInterest: false,
        collaborationAreas: "E-ticaret, fintech, eğitim"
      },
      {
        name: "Mehmet Demir",
        role: "Product Manager",
        category: "work" as const,
        closeness: 9 as const,
        city: "İstanbul",
        company: "StartupHub",
        age: "35",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "Boğaziçi Üniversitesi",
        educationDepartment: "İşletme",
        educationDegree: "MBA",
        workExperience: "10 yıl ürün yönetimi, 3 startup deneyimi",
        sectors: ["Teknoloji", "Fintech", "E-ticaret"],
        expertise: ["Ürün Stratejisi", "Agile", "Analytics"],
        services: ["Ürün Danışmanlığı", "Strateji"],
        personalTraits: ["Liderlik", "Analitik Düşünme", "İletişim"],
        values: ["Müşteri Odaklılık", "Veri Odaklılık", "İnovasyon"],
        goals: "Başarılı bir startup kurmak",
        vision: "Türkiye'de teknoloji ekosistemini büyütmek",
        interests: "Startup ekosistemi, yatırım, teknoloji trendleri",
        languages: ["Türkçe", "İngilizce", "İspanyolca"],
        isMentor: true,
        volunteerWork: "Startup mentorluğu",
        turningPoints: "İlk startup deneyimi, MBA eğitimi",
        challenges: "Pazar rekabeti ve kaynak yönetimi",
        lessons: "Müşteri ihtiyaçlarını anlamanın önemi",
        futureGoals: "Kendi fintech startup'ını kurmak",
        businessIdeas: "Dijital bankacılık çözümü",
        investmentInterest: true,
        collaborationAreas: "Fintech, e-ticaret, sağlık teknolojileri"
      },
      {
        name: "Ayşe Özkan",
        role: "Data Scientist",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "DataLab",
        age: "30",
        birthCity: "Bursa",
        currentCity: "Ankara",
        educationSchool: "Hacettepe Üniversitesi",
        educationDepartment: "İstatistik",
        educationDegree: "Doktora",
        workExperience: "6 yıl veri bilimi, makine öğrenmesi uzmanı",
        sectors: ["Teknoloji", "Sağlık", "Finans"],
        expertise: ["Machine Learning", "Python", "R", "SQL"],
        services: ["Veri Analizi", "AI Modelleme"],
        personalTraits: ["Analitik Düşünme", "Merak", "Sabır"],
        values: ["Bilimsel Yaklaşım", "Doğruluk", "Sürekli Öğrenme"],
        goals: "AI alanında uzmanlaşmak",
        vision: "Veri bilimini Türkiye'de yaygınlaştırmak",
        interests: "Yapay zeka, istatistik, araştırma",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: true,
        volunteerWork: "Veri bilimi eğitimi",
        turningPoints: "Doktora eğitimi, yurtdışı araştırma deneyimi",
        challenges: "Karmaşık veri setlerinde anlamlı sonuçlar çıkarma",
        lessons: "Veri kalitesinin önemi",
        futureGoals: "AI araştırma laboratuvarı kurmak",
        businessIdeas: "AI tabanlı sağlık teşhis sistemi",
        investmentInterest: false,
        collaborationAreas: "Sağlık teknolojileri, fintech, eğitim"
      },
      {
        name: "Can Arslan",
        role: "DevOps Engineer",
        category: "work" as const,
        closeness: 5 as const,
        city: "İzmir",
        company: "CloudTech",
        age: "29",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Bilgisayar Mühendisliği",
        educationDegree: "Lisans",
        workExperience: "7 yıl DevOps, cloud computing deneyimi",
        sectors: ["Teknoloji", "Cloud Computing"],
        expertise: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        services: ["DevOps Danışmanlığı", "Cloud Migration"],
        personalTraits: ["Sistem Düşüncesi", "Otomasyon Odaklı", "Problem Çözme"],
        values: ["Güvenilirlik", "Otomasyon", "Sürekli İyileştirme"],
        goals: "Cloud architecture uzmanı olmak",
        vision: "Türkiye'de cloud teknolojilerini yaygınlaştırmak",
        interests: "Cloud teknolojileri, otomasyon, sistem tasarımı",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Açık kaynak projelere katkı",
        turningPoints: "DevOps alanına geçiş",
        challenges: "Büyük ölçekli sistemlerde güvenlik",
        lessons: "Otomasyonun değeri ve güvenliğin önemi",
        futureGoals: "Cloud consulting şirketi kurmak",
        businessIdeas: "Cloud güvenlik çözümü",
        investmentInterest: true,
        collaborationAreas: "Cloud computing, güvenlik, IoT"
      },
      // Pazarlama ve İletişim Sektörü
      {
        name: "Elif Çetin",
        role: "Marketing Manager",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "BrandWorks",
        age: "31",
        birthCity: "Antalya",
        currentCity: "İstanbul",
        educationSchool: "Marmara Üniversitesi",
        educationDepartment: "İletişim",
        educationDegree: "Lisans",
        workExperience: "8 yıl dijital pazarlama, marka yönetimi",
        sectors: ["Pazarlama", "E-ticaret", "Medya"],
        expertise: ["Digital Marketing", "Brand Strategy", "Social Media"],
        services: ["Pazarlama Stratejisi", "Marka Danışmanlığı"],
        personalTraits: ["Yaratıcılık", "İletişim", "Stratejik Düşünme"],
        values: ["Marka Değeri", "Müşteri Memnuniyeti", "İnovasyon"],
        goals: "Global markalar için çalışmak",
        vision: "Türk markalarını dünya çapında tanıtmak",
        interests: "Sosyal medya, influencer marketing, trend analizi",
        languages: ["Türkçe", "İngilizce", "İtalyanca"],
        isMentor: true,
        volunteerWork: "Kadın girişimcilere mentorluk",
        turningPoints: "Yurtdışında çalışma deneyimi",
        challenges: "Pazar rekabeti ve ROI optimizasyonu",
        lessons: "Veri odaklı pazarlamanın önemi",
        futureGoals: "Kendi pazarlama ajansını kurmak",
        businessIdeas: "Influencer marketing platformu",
        investmentInterest: true,
        collaborationAreas: "E-ticaret, fintech, sağlık"
      },
      {
        name: "Burak Yıldız",
        role: "Content Creator",
        category: "work" as const,
        closeness: 4 as const,
        city: "İstanbul",
        company: "ContentHub",
        age: "26",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Gazetecilik",
        educationDegree: "Lisans",
        workExperience: "4 yıl içerik üretimi, sosyal medya yönetimi",
        sectors: ["Medya", "Eğlence", "E-ticaret"],
        expertise: ["Video Production", "Social Media", "Storytelling"],
        services: ["İçerik Üretimi", "Sosyal Medya Yönetimi"],
        personalTraits: ["Yaratıcılık", "İletişim", "Adaptasyon"],
        values: ["Orijinallik", "Eğlence", "Eğitim"],
        goals: "Milyonlarca takipçiye ulaşmak",
        vision: "Türkiye'de kaliteli içerik üretimini artırmak",
        interests: "Video düzenleme, fotoğrafçılık, seyahat",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Gençlere içerik üretimi eğitimi",
        turningPoints: "YouTube kanalı başlatma",
        challenges: "Sürekli içerik üretimi ve algoritma değişiklikleri",
        lessons: "Tutarlılığın ve kalitenin önemi",
        futureGoals: "Kendi medya şirketini kurmak",
        businessIdeas: "Eğitim içerik platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim, e-ticaret, turizm"
      },
      // Finans Sektörü
      {
        name: "Selin Korkmaz",
        role: "Financial Analyst",
        category: "work" as const,
        closeness: 6 as const,
        city: "İstanbul",
        company: "FinanceCorp",
        age: "33",
        birthCity: "İzmir",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Teknik Üniversitesi",
        educationDepartment: "Endüstri Mühendisliği",
        educationDegree: "Master",
        workExperience: "9 yıl finansal analiz, yatırım danışmanlığı",
        sectors: ["Finans", "Yatırım", "Bankacılık"],
        expertise: ["Financial Modeling", "Excel", "Risk Analysis"],
        services: ["Finansal Analiz", "Yatırım Danışmanlığı"],
        personalTraits: ["Analitik Düşünme", "Detay Odaklı", "Güvenilirlik"],
        values: ["Şeffaflık", "Güvenilirlik", "Sürdürülebilirlik"],
        goals: "Portföy yöneticisi olmak",
        vision: "Finansal okuryazarlığı artırmak",
        interests: "Ekonomi, yatırım, sürdürülebilir finans",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Finansal okuryazarlık eğitimi",
        turningPoints: "CFA sertifikası alma",
        challenges: "Piyasa volatilitesi ve risk yönetimi",
        lessons: "Diversifikasyonun önemi",
        futureGoals: "Kendi yatırım fonunu kurmak",
        businessIdeas: "Sürdürülebilir yatırım platformu",
        investmentInterest: true,
        collaborationAreas: "Fintech, sürdürülebilir yatırım, eğitim"
      },
      {
        name: "Deniz Aydın",
        role: "Accountant",
        category: "work" as const,
        closeness: 5 as const,
        city: "Ankara",
        company: "TaxOffice",
        age: "35",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Gazi Üniversitesi",
        educationDepartment: "Muhasebe",
        educationDegree: "Lisans",
        workExperience: "12 yıl muhasebe, vergi danışmanlığı",
        sectors: ["Muhasebe", "Vergi", "Danışmanlık"],
        expertise: ["Tax Planning", "Financial Reporting", "Audit"],
        services: ["Muhasebe", "Vergi Danışmanlığı"],
        personalTraits: ["Düzenlilik", "Güvenilirlik", "Detay Odaklı"],
        values: ["Doğruluk", "Güvenilirlik", "Profesyonellik"],
        goals: "Kendi muhasebe ofisini kurmak",
        vision: "Küçük işletmelere kaliteli muhasebe hizmeti",
        interests: "Vergi mevzuatı, finansal planlama, iş geliştirme",
        languages: ["Türkçe", "İngilizce"],
        isMentor: false,
        volunteerWork: "Küçük işletmelere ücretsiz danışmanlık",
        turningPoints: "Kendi ofisini açma kararı",
        challenges: "Sürekli değişen vergi mevzuatı",
        lessons: "Sürekli güncel kalmanın önemi",
        futureGoals: "Büyük bir muhasebe şirketi kurmak",
        businessIdeas: "Dijital muhasebe platformu",
        investmentInterest: false,
        collaborationAreas: "Fintech, e-ticaret, danışmanlık"
      },
      // Sağlık Sektörü
      {
        name: "Dr. Emre Şahin",
        role: "Medical Advisor",
        category: "work" as const,
        closeness: 8 as const,
        city: "İstanbul",
        company: "HealthTech",
        age: "38",
        birthCity: "Bursa",
        currentCity: "İstanbul",
        educationSchool: "Hacettepe Üniversitesi",
        educationDepartment: "Tıp",
        educationDegree: "Uzmanlık",
        workExperience: "15 yıl tıp deneyimi, 5 yıl sağlık teknolojileri",
        sectors: ["Sağlık", "Teknoloji", "Biyoteknoloji"],
        expertise: ["Telemedicine", "Health Tech", "Clinical Research"],
        services: ["Tıbbi Danışmanlık", "Sağlık Teknolojileri"],
        personalTraits: ["Empati", "Analitik Düşünme", "Liderlik"],
        values: ["Hasta Güvenliği", "Bilimsel Yaklaşım", "İnovasyon"],
        goals: "Sağlık teknolojilerinde öncü olmak",
        vision: "Sağlık hizmetlerini teknoloji ile iyileştirmek",
        interests: "Yapay zeka, telemedicine, klinik araştırmalar",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Sağlık taramaları ve eğitim",
        turningPoints: "Sağlık teknolojilerine geçiş",
        challenges: "Teknoloji ve tıbbı entegre etme",
        lessons: "Hasta odaklı yaklaşımın önemi",
        futureGoals: "Sağlık teknolojileri startup'ı kurmak",
        businessIdeas: "AI tabanlı teşhis sistemi",
        investmentInterest: true,
        collaborationAreas: "Sağlık teknolojileri, telemedicine, biyoteknoloji"
      },
      // Eğitim Sektörü
      {
        name: "Fatma Özkan",
        role: "Educational Content Creator",
        category: "work" as const,
        closeness: 6 as const,
        city: "İzmir",
        company: "EduTech",
        age: "29",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Eğitim Bilimleri",
        educationDegree: "Master",
        workExperience: "7 yıl eğitim içeriği üretimi, online eğitim",
        sectors: ["Eğitim", "Teknoloji", "Medya"],
        expertise: ["Curriculum Design", "Online Learning", "EdTech"],
        services: ["Eğitim İçeriği", "Öğretim Tasarımı"],
        personalTraits: ["Sabır", "Yaratıcılık", "İletişim"],
        values: ["Eğitim", "Erişilebilirlik", "Kalite"],
        goals: "Eğitim teknolojilerinde uzmanlaşmak",
        vision: "Kaliteli eğitimi herkese ulaştırmak",
        interests: "Eğitim teknolojileri, psikoloji, yaratıcı yazarlık",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: true,
        volunteerWork: "Köy okullarına eğitim desteği",
        turningPoints: "Online eğitime geçiş",
        challenges: "Farklı öğrenme stillerine uyum sağlama",
        lessons: "Kişiselleştirilmiş eğitimin önemi",
        futureGoals: "Kendi eğitim platformunu kurmak",
        businessIdeas: "Kişiselleştirilmiş öğrenme platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim teknolojileri, online eğitim, özel eğitim"
      },
      // Hukuk Sektörü
      {
        name: "Av. Mert Kaya",
        role: "Legal Counsel",
        category: "work" as const,
        closeness: 7 as const,
        city: "İstanbul",
        company: "LawFirm",
        age: "34",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Hukuk",
        educationDegree: "Lisans",
        workExperience: "10 yıl hukuk deneyimi, teknoloji hukuku uzmanı",
        sectors: ["Hukuk", "Teknoloji", "Finans"],
        expertise: ["Technology Law", "IP Law", "Contract Law"],
        services: ["Hukuki Danışmanlık", "Sözleşme Hazırlama"],
        personalTraits: ["Analitik Düşünme", "Güvenilirlik", "Detay Odaklı"],
        values: ["Adalet", "Güvenilirlik", "Profesyonellik"],
        goals: "Teknoloji hukukunda uzmanlaşmak",
        vision: "Teknoloji şirketlerine hukuki güvenlik sağlamak",
        interests: "Teknoloji hukuku, fikri mülkiyet, startup ekosistemi",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Startup'lara ücretsiz hukuki danışmanlık",
        turningPoints: "Teknoloji hukukuna odaklanma",
        challenges: "Hızlı değişen teknoloji ve mevzuat",
        lessons: "Sürekli güncel kalmanın önemi",
        futureGoals: "Kendi hukuk bürosunu kurmak",
        businessIdeas: "Legal tech platformu",
        investmentInterest: true,
        collaborationAreas: "Fintech, sağlık teknolojileri, e-ticaret"
      },
      // İnsan Kaynakları
      {
        name: "Gizem Demir",
        role: "HR Manager",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "TalentCorp",
        age: "32",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Orta Doğu Teknik Üniversitesi",
        educationDepartment: "Endüstri Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl insan kaynakları, talent acquisition",
        sectors: ["İnsan Kaynakları", "Teknoloji", "Danışmanlık"],
        expertise: ["Talent Acquisition", "Employee Relations", "HR Tech"],
        services: ["İK Danışmanlığı", "Yetenek Yönetimi"],
        personalTraits: ["İletişim", "Empati", "Organizasyon"],
        values: ["İnsan Odaklılık", "Adalet", "Gelişim"],
        goals: "İK teknolojilerinde uzmanlaşmak",
        vision: "Çalışan deneyimini iyileştirmek",
        interests: "Organizasyonel psikoloji, HR teknolojileri, kültür",
        languages: ["Türkçe", "İngilizce", "İspanyolca"],
        isMentor: true,
        volunteerWork: "Kariyer danışmanlığı",
        turningPoints: "İK alanına geçiş",
        challenges: "Yetenek savaşı ve kültür uyumu",
        lessons: "İnsan faktörünün önemi",
        futureGoals: "Kendi İK danışmanlık şirketini kurmak",
        businessIdeas: "HR tech platformu",
        investmentInterest: false,
        collaborationAreas: "Teknoloji, fintech, e-ticaret"
      },
      // Gayrimenkul
      {
        name: "Serkan Yılmaz",
        role: "Real Estate Specialist",
        category: "work" as const,
        closeness: 5 as const,
        city: "İstanbul",
        company: "PropertyCorp",
        age: "36",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "İşletme",
        educationDegree: "Lisans",
        workExperience: "12 yıl gayrimenkul, yatırım danışmanlığı",
        sectors: ["Gayrimenkul", "Yatırım", "Danışmanlık"],
        expertise: ["Property Investment", "Market Analysis", "Negotiation"],
        services: ["Gayrimenkul Danışmanlığı", "Yatırım Analizi"],
        personalTraits: ["İletişim", "Pazarlık", "Analitik Düşünme"],
        values: ["Güvenilirlik", "Müşteri Memnuniyeti", "Sürdürülebilirlik"],
        goals: "Büyük ölçekli projelerde uzmanlaşmak",
        vision: "Sürdürülebilir gayrimenkul geliştirme",
        interests: "Pazar analizi, sürdürülebilir yapılar, yatırım",
        languages: ["Türkçe", "İngilizce", "Arapça"],
        isMentor: false,
        volunteerWork: "Sosyal konut projeleri",
        turningPoints: "Yatırım odaklı gayrimenkul",
        challenges: "Pazar volatilitesi ve regülasyonlar",
        lessons: "Uzun vadeli düşünmenin önemi",
        futureGoals: "Kendi gayrimenkul şirketini kurmak",
        businessIdeas: "Proptech platformu",
        investmentInterest: true,
        collaborationAreas: "Proptech, fintech, sürdürülebilir yapılar"
      },
      // Lojistik
      {
        name: "Hakan Özkan",
        role: "Logistics Manager",
        category: "work" as const,
        closeness: 4 as const,
        city: "İzmir",
        company: "LogiTech",
        age: "40",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Dokuz Eylül Üniversitesi",
        educationDepartment: "Lojistik Yönetimi",
        educationDegree: "Lisans",
        workExperience: "15 yıl lojistik, tedarik zinciri yönetimi",
        sectors: ["Lojistik", "E-ticaret", "Üretim"],
        expertise: ["Supply Chain", "Warehouse Management", "Transportation"],
        services: ["Lojistik Danışmanlığı", "Tedarik Zinciri Optimizasyonu"],
        personalTraits: ["Organizasyon", "Problem Çözme", "Liderlik"],
        values: ["Verimlilik", "Güvenilirlik", "Sürdürülebilirlik"],
        goals: "Sürdürülebilir lojistik çözümleri geliştirmek",
        vision: "Türkiye'de lojistik sektörünü modernleştirmek",
        interests: "Sürdürülebilir lojistik, teknoloji, optimizasyon",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Afet lojistiği",
        turningPoints: "Sürdürülebilir lojistiğe odaklanma",
        challenges: "Maliyet optimizasyonu ve çevre dostu çözümler",
        lessons: "Sürdürülebilirliğin uzun vadeli faydaları",
        futureGoals: "Kendi lojistik şirketini kurmak",
        businessIdeas: "Yeşil lojistik platformu",
        investmentInterest: true,
        collaborationAreas: "E-ticaret, sürdürülebilir lojistik, IoT"
      },
      // Enerji
      {
        name: "Merve Arslan",
        role: "Energy Consultant",
        category: "work" as const,
        closeness: 6 as const,
        city: "Ankara",
        company: "GreenEnergy",
        age: "31",
        birthCity: "Ankara",
        currentCity: "Ankara",
        educationSchool: "Orta Doğu Teknik Üniversitesi",
        educationDepartment: "Enerji Sistemleri Mühendisliği",
        educationDegree: "Master",
        workExperience: "8 yıl enerji danışmanlığı, yenilenebilir enerji",
        sectors: ["Enerji", "Sürdürülebilirlik", "Teknoloji"],
        expertise: ["Renewable Energy", "Energy Efficiency", "Sustainability"],
        services: ["Enerji Danışmanlığı", "Sürdürülebilirlik"],
        personalTraits: ["Analitik Düşünme", "Sürdürülebilirlik Odaklı", "İnovasyon"],
        values: ["Sürdürülebilirlik", "Çevre Bilinci", "İnovasyon"],
        goals: "Temiz enerji çözümleri geliştirmek",
        vision: "Türkiye'de yenilenebilir enerjiyi yaygınlaştırmak",
        interests: "Yenilenebilir enerji, sürdürülebilirlik, teknoloji",
        languages: ["Türkçe", "İngilizce", "Almanca"],
        isMentor: true,
        volunteerWork: "Çevre eğitimi ve farkındalık",
        turningPoints: "Yenilenebilir enerji alanına geçiş",
        challenges: "Fosil yakıt bağımlılığından kurtulma",
        lessons: "Sürdürülebilir çözümlerin uzun vadeli faydaları",
        futureGoals: "Kendi temiz enerji şirketini kurmak",
        businessIdeas: "Enerji verimliliği platformu",
        investmentInterest: true,
        collaborationAreas: "Yenilenebilir enerji, teknoloji, sürdürülebilirlik"
      },
      // Çevre
      {
        name: "Ece Yıldız",
        role: "Environmental Specialist",
        category: "work" as const,
        closeness: 5 as const,
        city: "İzmir",
        company: "EcoTech",
        age: "28",
        birthCity: "İzmir",
        currentCity: "İzmir",
        educationSchool: "Ege Üniversitesi",
        educationDepartment: "Çevre Mühendisliği",
        educationDegree: "Lisans",
        workExperience: "5 yıl çevre danışmanlığı, sürdürülebilirlik",
        sectors: ["Çevre", "Sürdürülebilirlik", "Danışmanlık"],
        expertise: ["Environmental Assessment", "Sustainability", "Waste Management"],
        services: ["Çevre Danışmanlığı", "Sürdürülebilirlik"],
        personalTraits: ["Çevre Bilinci", "Analitik Düşünme", "Problem Çözme"],
        values: ["Sürdürülebilirlik", "Çevre Koruma", "Toplumsal Fayda"],
        goals: "Çevre teknolojilerinde uzmanlaşmak",
        vision: "Sürdürülebilir bir gelecek için çalışmak",
        interests: "Çevre teknolojileri, sürdürülebilirlik, eğitim",
        languages: ["Türkçe", "İngilizce", "Fransızca"],
        isMentor: false,
        volunteerWork: "Çevre eğitimi ve temizlik kampanyaları",
        turningPoints: "Çevre mühendisliği eğitimi",
        challenges: "Çevre bilinci oluşturma ve uygulama",
        lessons: "Küçük değişikliklerin büyük etkileri",
        futureGoals: "Kendi çevre danışmanlık şirketini kurmak",
        businessIdeas: "Sürdürülebilirlik platformu",
        investmentInterest: false,
        collaborationAreas: "Sürdürülebilirlik, teknoloji, eğitim"
      },
      // Medya
      {
        name: "Kaan Demir",
        role: "Media Producer",
        category: "work" as const,
        closeness: 4 as const,
        city: "İstanbul",
        company: "MediaCorp",
        age: "27",
        birthCity: "İstanbul",
        currentCity: "İstanbul",
        educationSchool: "İstanbul Üniversitesi",
        educationDepartment: "Radyo, Televizyon ve Sinema",
        educationDegree: "Lisans",
        workExperience: "6 yıl medya üretimi, video prodüksiyon",
        sectors: ["Medya", "Eğlence", "E-ticaret"],
        expertise: ["Video Production", "Content Creation", "Digital Media"],
        services: ["Video Prodüksiyon", "İçerik Üretimi"],
        personalTraits: ["Yaratıcılık", "Teknik Beceri", "İletişim"],
        values: ["Kalite", "Yaratıcılık", "İnovasyon"],
        goals: "Uluslararası projelerde çalışmak",
        vision: "Türkiye'de kaliteli medya içeriği üretmek",
        interests: "Video düzenleme, sinema, dijital medya",
        languages: ["Türkçe", "İngilizce", "İtalyanca"],
        isMentor: false,
        volunteerWork: "Gençlere medya eğitimi",
        turningPoints: "Dijital medyaya geçiş",
        challenges: "Teknoloji değişikliklerine adaptasyon",
        lessons: "Sürekli öğrenmenin önemi",
        futureGoals: "Kendi prodüksiyon şirketini kurmak",
        businessIdeas: "Dijital medya platformu",
        investmentInterest: false,
        collaborationAreas: "Eğitim, e-ticaret, eğlence"
      }
    ];

    // Add seed people
    for (const person of seedPeople) {
      await this.addPerson({
        ...person,
        email: `${person.name.toLowerCase().replace(' ', '.')}@example.com`,
        phone: `+90 5${Math.floor(Math.random() * 90000000) + 10000000}`,
        services: person.services || [],
        tags: person.category === "work" ? ["Professional", "Network"] : ["Personal"],
      });
    }

    // Create comprehensive network links
    const people = this.people;
    const links = [
      // Teknoloji ekosistemi
      { source: people[0].id, target: people[1].id }, // Senior Engineer -> UX Designer
      { source: people[0].id, target: people[2].id }, // Senior Engineer -> Product Manager
      { source: people[0].id, target: people[3].id }, // Senior Engineer -> Data Scientist
      { source: people[0].id, target: people[4].id }, // Senior Engineer -> DevOps Engineer
      
      // Ürün ekibi
      { source: people[2].id, target: people[1].id }, // Product Manager -> UX Designer
      { source: people[2].id, target: people[3].id }, // Product Manager -> Data Scientist
      { source: people[2].id, target: people[5].id }, // Product Manager -> Marketing Manager
      
      // Pazarlama ekibi
      { source: people[5].id, target: people[6].id }, // Marketing Manager -> Content Creator
      { source: people[5].id, target: people[7].id }, // Marketing Manager -> Financial Analyst
      
      // Finans ekibi
      { source: people[7].id, target: people[8].id }, // Financial Analyst -> Accountant
      { source: people[7].id, target: people[9].id }, // Financial Analyst -> Medical Advisor
      
      // Sağlık teknolojileri
      { source: people[9].id, target: people[3].id }, // Medical Advisor -> Data Scientist
      { source: people[9].id, target: people[10].id }, // Medical Advisor -> Educational Content Creator
      
      // Eğitim ekibi
      { source: people[10].id, target: people[11].id }, // Educational Content Creator -> Legal Counsel
      { source: people[10].id, target: people[12].id }, // Educational Content Creator -> HR Manager
      
      // Hukuk ve İK
      { source: people[11].id, target: people[12].id }, // Legal Counsel -> HR Manager
      { source: people[11].id, target: people[13].id }, // Legal Counsel -> Real Estate Specialist
      
      // Gayrimenkul ve lojistik
      { source: people[13].id, target: people[14].id }, // Real Estate Specialist -> Logistics Manager
      { source: people[13].id, target: people[15].id }, // Real Estate Specialist -> Energy Consultant
      
      // Enerji ve çevre
      { source: people[15].id, target: people[16].id }, // Energy Consultant -> Environmental Specialist
      { source: people[15].id, target: people[17].id }, // Energy Consultant -> Media Producer
      
      // Medya ve içerik
      { source: people[17].id, target: people[6].id }, // Media Producer -> Content Creator
      { source: people[17].id, target: people[10].id }, // Media Producer -> Educational Content Creator
      
      // Cross-sector connections
      { source: people[0].id, target: people[5].id }, // Senior Engineer -> Marketing Manager
      { source: people[1].id, target: people[6].id }, // UX Designer -> Content Creator
      { source: people[3].id, target: people[7].id }, // Data Scientist -> Financial Analyst
      { source: people[4].id, target: people[14].id }, // DevOps Engineer -> Logistics Manager
      { source: people[8].id, target: people[11].id }, // Accountant -> Legal Counsel
      { source: people[12].id, target: people[16].id }, // HR Manager -> Environmental Specialist
    ];

    for (const link of links) {
      await this.addLink(link);
    }
  }
}

// Factory function to get the appropriate repository
export const useNetworkRepository = (): NetworkRepository => {
  // Check if we're in a browser environment and Supabase is available
  if (typeof window !== 'undefined' && supabase) {
    return new SupabaseNetworkRepository();
  }
  return new MockNetworkRepository();
};
