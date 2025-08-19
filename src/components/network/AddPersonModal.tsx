import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import emailjs from '@emailjs/browser';
import { 
  UserPlus, 
  Upload, 
  Link as LinkIcon,
  Building2,
  Heart,
  Home,
  MoreHorizontal,
  X,
  User,
  GraduationCap,
  Briefcase,
  Target,
  Users,
  Globe,
  BookOpen,
  Award,
  Lightbulb,
  TrendingUp,
  Calendar,
  MapPin,
  Languages,
  Star,
  Shield,
  Zap,
  Eye,
  Flag,
  Clock,
  CheckCircle,
  Mail
} from 'lucide-react';
import { useNetworkStore } from '@/store/network';
import { getCategoryColor } from '@/utils/colorTokens';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddPersonModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'quick';
  onSuccess?: (person: any) => void;
  parentContactId?: string;
  inviteToken?: string;
  isInviteLink?: boolean;
}

const categoryOptions = [
  { value: 'work', label: 'İş', icon: Building2, color: 'bg-blue-500' },
  { value: 'family', label: 'Aile', icon: Home, color: 'bg-rose-500' },
  { value: 'friend', label: 'Arkadaş', icon: Heart, color: 'bg-green-500' },
  { value: 'other', label: 'Diğer', icon: MoreHorizontal, color: 'bg-slate-500' },
];

const sectorOptions = [
  'Teknoloji', 'Finans', 'Sağlık', 'Eğitim', 'Pazarlama', 'Tasarım', 
  'Mühendislik', 'Hukuk', 'Danışmanlık', 'Üretim', 'Perakende', 'E-ticaret',
  'Medya', 'Turizm', 'İnşaat', 'Enerji', 'Diğer'
];

const expertiseOptions = [
  'Yazılım Geliştirme', 'UI/UX Tasarım', 'Pazarlama', 'Satış', 'Finans',
  'İnsan Kaynakları', 'Operasyon', 'Strateji', 'Araştırma', 'Eğitim',
  'Danışmanlık', 'Yaratıcı İçerik', 'Veri Analizi', 'Proje Yönetimi',
  'Müşteri Hizmetleri', 'Lojistik', 'Kalite Kontrol', 'Diğer'
];

const serviceOptions = [
  'Web Tasarım', 'Mobil Uygulama', 'Grafik Tasarım', 'Dijital Pazarlama',
  'SEO', 'Sosyal Medya Yönetimi', 'İçerik Yazarlığı', 'Video Prodüksiyon',
  'Muhasebe', 'Hukuki Danışmanlık', 'İK Danışmanlığı', 'Strateji Danışmanlığı',
  'Eğitim', 'Koçluk', 'Mentorluk', 'Yatırım Danışmanlığı', 'Diğer'
];

const languageOptions = [
  'Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'İtalyanca',
  'Rusça', 'Arapça', 'Çince', 'Japonca', 'Korece', 'Diğer'
];

const personalTraits = [
  { id: 'honesty', label: 'Dürüstlük' },
  { id: 'reliability', label: 'Güvenilirlik' },
  { id: 'discipline', label: 'Disiplin' },
  { id: 'hardworking', label: 'Çalışkanlık' },
  { id: 'patience', label: 'Sabırlılık' },
  { id: 'leadership', label: 'Liderlik' },
  { id: 'teamwork', label: 'Takım Çalışması' },
  { id: 'communication', label: 'İletişim Becerisi' },
  { id: 'creativity', label: 'Yaratıcılık' },
  { id: 'adaptability', label: 'Uyum Yeteneği' }
];

const values = [
  'Etik', 'Sürdürülebilirlik', 'Topluma Fayda', 'İnovasyon', 'Kalite',
  'Müşteri Odaklılık', 'Sürekli Öğrenme', 'Şeffaflık', 'Adalet', 'Empati'
];

const interests = [
  'Spor', 'Seyahat', 'Kitap Okuma', 'Teknoloji', 'Müzik', 'Sanat',
  'Yemek Yapma', 'Fotoğrafçılık', 'Bahçıvanlık', 'Koleksiyon', 'Oyun',
  'Dans', 'Yoga', 'Meditasyon', 'Gönüllülük', 'Diğer'
];

export const AddPersonModal = ({ 
  open, 
  onOpenChange, 
  variant = 'default', 
  onSuccess, 
  parentContactId,
  inviteToken,
  isInviteLink = false
}: AddPersonModalProps) => {
  const { addPerson } = useNetworkStore();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true); // Default to true for invite flow
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);

  // Get current user ID and contact ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Skip trying to find a contact for the current user
        // This query was causing 406 errors due to RLS policy restrictions
        // The invite functions will handle contact creation and linking appropriately
        // Force refresh to clear browser cache
        console.log('Skipping current user contact lookup to avoid RLS issues - CACHE CLEAR');
      }
    };
    getCurrentUser();
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    birthCity: '',
    currentCity: '',
    education: {
      school: '',
      department: '',
      degree: '',
      graduationYear: ''
    },
    role: '',
    company: '',
    sectors: [] as string[],
    customSector: '',
    workExperience: '',
    expertise: [] as string[],
    customExpertise: '',
    services: [] as string[],
    customService: '',
    investments: '',
    category: 'work' as const,
    closeness: 5 as const,
    personalTraits: [] as string[],
    values: [] as string[],
    goals: '',
    vision: '',

    customInterest: '',
    languages: [] as string[],
    customLanguage: '',
    isMentor: false,
    volunteerWork: '',
    turningPoints: '',
    challenges: '',
    lessons: '',
    futureGoals: '',
    businessIdeas: '',
    investmentInterest: false,
    collaborationAreas: '',
    email: '',
    phone: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "İsim alanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // If inviteToken exists, submit via Edge Function (no auth required)
      if (inviteToken) {
        const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        // Use different endpoints based on the type
        const shouldUseInviteLinkEndpoint = isInviteLink || window.location.pathname.includes('/invite-link/');
        const endpoint = shouldUseInviteLinkEndpoint 
          ? 'https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/invite-link-submit'
          : 'https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/invite-submit-new';
        

        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc'
          },
          body: JSON.stringify({
            token: inviteToken,
            sendEmail: sendEmail, // Use the email sending preference
            base_url: window.location.origin,
            contact: {
              first_name: firstName,
              last_name: lastName,
              city: formData.currentCity.trim() || undefined,
              profession: formData.role.trim() || undefined,
              relationship_degree: formData.closeness,
              tags: formData.expertise,
              phone: formData.phone.trim() || undefined,
              email: formData.email.trim() || undefined,
              description: formData.description.trim() || undefined,
              parent_contact_id: parentContactId || null,
              // New comprehensive fields
              age: formData.age || undefined,
              birth_city: formData.birthCity.trim() || undefined,
              current_city: formData.currentCity.trim() || undefined,
              education_school: formData.education.school || undefined,
              education_department: formData.education.department || undefined,
              education_degree: formData.education.degree || undefined,
              education_graduation_year: formData.education.graduationYear || undefined,
              company: formData.company.trim() || undefined,
              sectors: formData.customSector ? [...formData.sectors.filter(s => s !== 'Diğer'), formData.customSector] : formData.sectors,
              customSector: formData.customSector.trim() || undefined,
              work_experience: formData.workExperience.trim() || undefined,
              expertise: formData.customExpertise ? [...formData.expertise.filter(e => e !== 'Diğer'), formData.customExpertise] : formData.expertise,
              custom_expertise: formData.customExpertise.trim() || undefined,
              services: formData.customService ? [...formData.services.filter(s => s !== 'Diğer'), formData.customService] : formData.services,
              custom_service: formData.customService.trim() || undefined,
              investments: formData.investments.trim() || undefined,
              personal_traits: formData.personalTraits,
              values: formData.values,
              goals: formData.goals.trim() || undefined,
              vision: formData.vision.trim() || undefined,

              languages: formData.customLanguage ? [...formData.languages.filter(l => l !== 'Diğer'), formData.customLanguage] : formData.languages,
              custom_language: formData.customLanguage.trim() || undefined,
              is_mentor: formData.isMentor,
              volunteer_work: formData.volunteerWork.trim() || undefined,
              turning_points: formData.turningPoints.trim() || undefined,
              challenges: formData.challenges.trim() || undefined,
              lessons: formData.lessons.trim() || undefined,
              future_goals: formData.futureGoals.trim() || undefined,
              business_ideas: formData.businessIdeas.trim() || undefined,
              investment_interest: formData.investmentInterest,
              collaboration_areas: formData.collaborationAreas.trim() || undefined,
            },
          })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
          console.log('Error response:', errorData);
          toast({ title: "Kaydedilemedi", description: errorData.error || `HTTP ${response.status}`, variant: "destructive" });
          return;
        }

        const data = await response.json();
        const newPerson = {
          id: data.contact_id,
          name: formData.name.trim(),
          first_name: firstName,
          last_name: lastName,
          // Temel Bilgiler
          age: formData.age || undefined,
          birthCity: formData.birthCity.trim() || undefined,
          currentCity: formData.currentCity.trim() || undefined,
          education: {
            school: formData.education.school || undefined,
            department: formData.education.department || undefined,
            degree: formData.education.degree || undefined,
            graduationYear: formData.education.graduationYear || undefined,
          },
          // İş ve Profesyonel Bilgiler
          company: formData.company.trim() || undefined,
          sectors: formData.customSector ? [...formData.sectors.filter(s => s !== 'Diğer'), formData.customSector] : formData.sectors,
          customSector: formData.customSector.trim() || undefined,
          workExperience: formData.workExperience.trim() || undefined,
          expertise: formData.customExpertise ? [...formData.expertise.filter(e => e !== 'Diğer'), formData.customExpertise] : formData.expertise,
          customExpertise: formData.customExpertise.trim() || undefined,
          services: formData.customService ? [...formData.services.filter(s => s !== 'Diğer'), formData.customService] : formData.services,
          customService: formData.customService.trim() || undefined,
          investments: formData.investments.trim() || undefined,
          // Kişisel Özellikler
          personalTraits: formData.personalTraits,
          values: formData.values,
          goals: formData.goals.trim() || undefined,
          vision: formData.vision.trim() || undefined,
          // Sosyal ve Networking
          customInterest: formData.customInterest.trim() || undefined,
          languages: formData.customLanguage ? [...formData.languages.filter(l => l !== 'Diğer'), formData.customLanguage] : formData.languages,
          customLanguage: formData.customLanguage.trim() || undefined,
          isMentor: formData.isMentor,
          volunteerWork: formData.volunteerWork.trim() || undefined,
          // Kritik Yaşam Deneyimleri
          turningPoints: formData.turningPoints.trim() || undefined,
          challenges: formData.challenges.trim() || undefined,
          lessons: formData.lessons.trim() || undefined,
          // İleriye Dönük Planlar
          futureGoals: formData.futureGoals.trim() || undefined,
          businessIdeas: formData.businessIdeas.trim() || undefined,
          investmentInterest: formData.investmentInterest,
          collaborationAreas: formData.collaborationAreas.trim() || undefined,
          // İletişim Bilgileri
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          description: formData.description.trim() || undefined,
          // Diğer
          role: formData.role.trim() || undefined,
          city: formData.currentCity.trim() || undefined,
          category: formData.category,
          closeness: formData.closeness,
          parent_contact_id: parentContactId || null,
        };

        // Send email if requested
        if (sendEmail && formData.email) {
          try {
            const templateParams = {
              to_email: formData.email,
              user_email: formData.email,
              email: formData.email,
              recipient_email: formData.email,
              to_name: formData.name.trim(),
              user_name: formData.name.trim(),
              name: formData.name.trim(),
              from_name: 'NetworkGPT',
              from_email: 'eda@rooktech.ai',
              reply_to: 'eda@rooktech.ai',
              subject: '🎟️ Ağınıza katılımınız kaydedildi',
              message: `Merhaba ${firstName},\n\nBilgileriniz başarıyla alındı. Davet bağlantınızı kullanarak ağa katıldınız.\n\nSevgiler, NetworkGPT`
            } as Record<string, string>;

            const emailResult = await emailjs.send(
              'service_cqmrqtj',
              'template_4cm4nqr',
              templateParams,
              '2HL35Reb4zyohI0T9'
            );

            if (emailResult.status === 200) {
              toast({ 
                title: "Başarılı", 
                description: `${newPerson.name} başarıyla eklendi. Bilgilendirme e-postası gönderildi.`
              });
            } else {
              toast({ 
                title: "Başarılı", 
                description: `${newPerson.name} başarıyla eklendi. E-posta gönderilemedi.`
              });
            }
          } catch (emailErr: any) {
            console.warn('EmailJS send error:', emailErr);
            toast({ 
              title: "Başarılı", 
              description: `${newPerson.name} başarıyla eklendi. E-posta gönderilemedi.`
            });
          }
        } else {
          toast({
            title: "Başarılı",
            description: `${newPerson.name} başarıyla eklendi.`
          });
        }

        onSuccess?.(newPerson);
        onOpenChange?.(false);
        
        // Refresh contacts to show the newly added person
        window.dispatchEvent(new CustomEvent("contacts:refresh"));
        
        // Reset form
        setFormData({
          name: '',
          age: '',
          birthCity: '',
          currentCity: '',
          education: { school: '', department: '', degree: '', graduationYear: '' },
          role: '',
          company: '',
          sectors: [],
          customSector: '',
          workExperience: '',
          expertise: [],
          customExpertise: '',
          services: [],
          customService: '',
          investments: '',
          category: 'work',
          closeness: 5,
          personalTraits: [],
          values: [],
          goals: '',
          vision: '',
          interests: '',
          customInterest: '',
          languages: [],
          customLanguage: '',
          isMentor: false,
          volunteerWork: '',
          turningPoints: '',
          challenges: '',
          lessons: '',
          futureGoals: '',
          businessIdeas: '',
          investmentInterest: false,
          collaborationAreas: '',
          email: '',
          phone: '',
          description: '',
        });
      } else {
        // Regular addPerson flow - connect to current user (RookTech)
        const newPerson = await addPerson({
          name: formData.name.trim(),
          age: formData.age || undefined,
          birthCity: formData.birthCity.trim() || undefined,
          currentCity: formData.currentCity.trim() || undefined,
          education: formData.education,
          role: formData.role.trim() || undefined,
          company: formData.company.trim() || undefined,
          sectors: formData.customSector ? [...formData.sectors.filter(s => s !== 'Diğer'), formData.customSector] : formData.sectors,
          customSector: formData.customSector.trim() || undefined,
          workExperience: formData.workExperience.trim() || undefined,
          expertise: formData.customExpertise ? [...formData.expertise.filter(e => e !== 'Diğer'), formData.customExpertise] : formData.expertise,
          customExpertise: formData.customExpertise.trim() || undefined,
          services: formData.customService ? [...formData.services.filter(s => s !== 'Diğer'), formData.customService] : formData.services,
          customService: formData.customService.trim() || undefined,
          investments: formData.investments.trim() || undefined,
          category: formData.category,
          closeness: formData.closeness, // Use closeness from form
          personalTraits: formData.personalTraits,
          values: formData.values,
          goals: formData.goals.trim() || undefined,
          vision: formData.vision.trim() || undefined,

          languages: formData.customLanguage ? [...formData.languages.filter(l => l !== 'Diğer'), formData.customLanguage] : formData.languages,
          customLanguage: formData.customLanguage.trim() || undefined,
          isMentor: formData.isMentor,
          volunteerWork: formData.volunteerWork.trim() || undefined,
          turningPoints: formData.turningPoints.trim() || undefined,
          challenges: formData.challenges.trim() || undefined,
          lessons: formData.lessons.trim() || undefined,
          futureGoals: formData.futureGoals.trim() || undefined,
          businessIdeas: formData.businessIdeas.trim() || undefined,
          investmentInterest: formData.investmentInterest,
          collaborationAreas: formData.collaborationAreas.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          description: formData.description.trim() || undefined,
          parent_contact_id: currentContactId || null, // Connect to current user (RookTech) if available
        });

        toast({
          title: "Başarılı",
          description: `${newPerson.name} başarıyla eklendi.`
        });

        onSuccess?.(newPerson);
        onOpenChange?.(false);
        
        // Refresh contacts to show the newly added person
        window.dispatchEvent(new CustomEvent("contacts:refresh"));
        
        // Reset form
        setFormData({
          name: '',
          age: '',
          birthCity: '',
          currentCity: '',
          education: { school: '', department: '', degree: '', graduationYear: '' },
          role: '',
          company: '',
          sectors: [],
          customSector: '',
          workExperience: '',
          expertise: [],
          customExpertise: '',
          services: [],
          customService: '',
          investments: '',
          category: 'work',
          closeness: 5,
          personalTraits: [],
          values: [],
          goals: '',
          vision: '',
          interests: '',
          customInterest: '',
          languages: [],
          customLanguage: '',
          isMentor: false,
          volunteerWork: '',
          turningPoints: '',
          challenges: '',
          lessons: '',
          futureGoals: '',
          businessIdeas: '',
          investmentInterest: false,
          collaborationAreas: '',
          email: '',
          phone: '',
          description: '',
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kişi eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (field: keyof typeof formData.education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: { ...prev.education, [field]: value }
    }));
  };

  const handleArrayChange = (field: keyof typeof formData, value: string, action: 'add' | 'remove') => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (action === 'add' && !currentArray.includes(value)) {
        return { ...prev, [field]: [...currentArray, value] };
      } else if (action === 'remove') {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
      return prev;
    });
  };

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);

  return (
    <>
      {variant === 'default' ? (
        <div className="space-y-6 relative z-30">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
              <UserPlus className="h-6 w-6" />
              Yeni Kişi Ekle
            </h2>
            <p className="text-muted-foreground">Ağınıza yeni bir bağlantı ekleyin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tabs for organized sections */}
            <Tabs defaultValue="basic" className="w-full relative z-40">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Temel
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  İş
                </TabsTrigger>
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Kişisel
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Sosyal
                </TabsTrigger>
                <TabsTrigger value="experience" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Deneyim
                </TabsTrigger>
                <TabsTrigger value="future" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Gelecek
                </TabsTrigger>
              </TabsList>

              {/* Temel Bilgiler */}
              <TabsContent value="basic" className="space-y-4 relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      placeholder="Ad Soyad"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Yaş</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="birthCity">Nereli</Label>
                    <Input
                      id="birthCity"
                      placeholder="İstanbul"
                      value={formData.birthCity}
                      onChange={(e) => handleInputChange('birthCity', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentCity">Şu An Yaşadığı Şehir</Label>
                    <Input
                      id="currentCity"
                      placeholder="İstanbul"
                      value={formData.currentCity}
                      onChange={(e) => handleInputChange('currentCity', e.target.value)}
                    />
                  </div>
                </div>

                {/* Eğitim Bilgileri */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Eğitim Geçmişi
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="school">Okul/Üniversite</Label>
                      <Input
                        id="school"
                        placeholder="Boğaziçi Üniversitesi"
                        value={formData.education.school}
                        onChange={(e) => handleEducationChange('school', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Bölüm</Label>
                      <Input
                        id="department"
                        placeholder="Bilgisayar Mühendisliği"
                        value={formData.education.department}
                        onChange={(e) => handleEducationChange('department', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Derece</Label>
                      <Input
                        id="degree"
                        placeholder="Lisans"
                        value={formData.education.degree}
                        onChange={(e) => handleEducationChange('degree', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Mezuniyet Yılı</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        placeholder="2020"
                        value={formData.education.graduationYear}
                        onChange={(e) => handleEducationChange('graduationYear', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    İletişim Bilgileri
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+90 5XX XXX XX XX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Genel Açıklama */}
                <div>
                  <Label htmlFor="description">Genel Açıklama</Label>
                  <Textarea
                    id="description"
                    placeholder="Kişi hakkında genel notlar..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Email sending option for invite flow */}
                {inviteToken && (
                  <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="sendEmail" className="text-sm text-muted-foreground">
                      Kişiye e-posta göndermek ister misiniz?
                    </label>
                  </div>
                )}
              </TabsContent>

              {/* İş ve Profesyonel Bilgiler */}
              <TabsContent value="professional" className="space-y-4 relative z-40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Pozisyon</Label>
                    <Input
                      id="role"
                      placeholder="Senior Frontend Developer"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Şirket</Label>
                    <Input
                      id="company"
                      placeholder="Google"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                </div>

                {/* Sektörler */}
                <div>
                  <Label>Sektörler</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {sectorOptions.map((sector) => (
                      <Button
                        key={sector}
                        type="button"
                        variant={formData.sectors.includes(sector) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayChange('sectors', sector, formData.sectors.includes(sector) ? 'remove' : 'add')}
                      >
                        {sector}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Özel Sektör Girişi */}
                  {formData.sectors.includes('Diğer') && (
                    <div className="mt-3">
                      <Label htmlFor="customSector">Özel Sektör</Label>
                      <Input
                        id="customSector"
                        placeholder="Özel sektör adını girin..."
                        value={formData.customSector || ''}
                        onChange={(e) => handleInputChange('customSector', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Uzmanlık Alanları */}
                <div>
                  <Label>Uzmanlık Alanları</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {expertiseOptions.map((expertise) => (
                      <Button
                        key={expertise}
                        type="button"
                        variant={formData.expertise.includes(expertise) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayChange('expertise', expertise, formData.expertise.includes(expertise) ? 'remove' : 'add')}
                      >
                        {expertise}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Özel Uzmanlık Girişi */}
                  {formData.expertise.includes('Diğer') && (
                    <div className="mt-3">
                      <Label htmlFor="customExpertise">Özel Uzmanlık</Label>
                      <Input
                        id="customExpertise"
                        placeholder="Özel uzmanlık alanını girin..."
                        value={formData.customExpertise || ''}
                        onChange={(e) => handleInputChange('customExpertise', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Verebileceği Hizmetler */}
                <div>
                  <Label>Verebileceği Hizmetler</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {serviceOptions.map((service) => (
                      <Button
                        key={service}
                        type="button"
                        variant={formData.services.includes(service) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayChange('services', service, formData.services.includes(service) ? 'remove' : 'add')}
                      >
                        {service}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Özel Hizmet Girişi */}
                  {formData.services.includes('Diğer') && (
                    <div className="mt-3">
                      <Label htmlFor="customService">Özel Hizmet</Label>
                      <Input
                        id="customService"
                        placeholder="Özel hizmet adını girin..."
                        value={formData.customService || ''}
                        onChange={(e) => handleInputChange('customService', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* İş Deneyimi */}
                <div>
                  <Label htmlFor="workExperience">İş Deneyimi (Kısa Notlar)</Label>
                  <Textarea
                    id="workExperience"
                    placeholder="Önceki iş deneyimleri, projeler, başarılar..."
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Yatırım Yaptığı Projeler */}
                <div>
                  <Label htmlFor="investments">Yatırım Yaptığı veya Destek Verdiği Projeler</Label>
                  <Textarea
                    id="investments"
                    placeholder="Yatırım yaptığı projeler, destek verdiği girişimler..."
                    value={formData.investments}
                    onChange={(e) => handleInputChange('investments', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Kişisel Özellikler */}
              <TabsContent value="personal" className="space-y-4 relative z-40">
                {/* Category and Closeness */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kategori</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {categoryOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = formData.category === option.value;
                        
                        return (
                          <Button
                            key={option.value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`h-auto p-3 flex flex-col items-center gap-2 ${
                              isSelected ? option.color : 'bg-white/10 border-white/20 hover:bg-white/20'
                            }`}
                            onClick={() => handleInputChange('category', option.value)}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-xs">{option.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Yakınlık Seviyesi</Label>
                    <div className="mt-2 space-y-3">
                      <Slider
                        value={[formData.closeness]}
                        onValueChange={(value) => handleInputChange('closeness', value[0])}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uzak (1)</span>
                        <Badge variant="secondary" className="text-xs">
                          {formData.closeness}/10
                        </Badge>
                        <span>Yakın (10)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kişisel Özellikler */}
                <div>
                  <Label>Kişisel Özellikler</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {personalTraits.map((trait) => (
                      <div key={trait.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={trait.id}
                          checked={formData.personalTraits.includes(trait.label)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleArrayChange('personalTraits', trait.label, 'add');
                            } else {
                              handleArrayChange('personalTraits', trait.label, 'remove');
                            }
                          }}
                        />
                        <Label htmlFor={trait.id} className="text-sm">{trait.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Değerler */}
                <div>
                  <Label>Değer Verdiği Prensipler</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {values.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={formData.values.includes(value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayChange('values', value, formData.values.includes(value) ? 'remove' : 'add')}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="goals">Hedefleri</Label>
                  <Textarea
                    id="goals"
                    placeholder="Kısa ve uzun vadeli hedefleri..."
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="vision">Vizyonu</Label>
                  <Textarea
                    id="vision"
                    placeholder="Kişisel vizyonu ve misyonu..."
                    value={formData.vision}
                    onChange={(e) => handleInputChange('vision', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Sosyal ve Networking */}
              <TabsContent value="social" className="space-y-4 relative z-40">
                              

                {/* Konuştuğu Diller */}
                <div>
                  <Label>Konuştuğu Diller</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {languageOptions.map((language) => (
                      <Button
                        key={language}
                        type="button"
                        variant={formData.languages.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleArrayChange('languages', language, formData.languages.includes(language) ? 'remove' : 'add')}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Özel Dil Girişi */}
                  {formData.languages.includes('Diğer') && (
                    <div className="mt-3">
                      <Label htmlFor="customLanguage">Özel Dil</Label>
                      <Input
                        id="customLanguage"
                        placeholder="Özel dil adını girin..."
                        value={formData.customLanguage || ''}
                        onChange={(e) => handleInputChange('customLanguage', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isMentor"
                    checked={formData.isMentor}
                    onCheckedChange={(checked) => handleInputChange('isMentor', checked)}
                  />
                  <Label htmlFor="isMentor">Mentor olarak hizmet veriyor</Label>
                </div>

                <div>
                  <Label htmlFor="volunteerWork">Gönüllü İşler / Topluluk Deneyimleri</Label>
                  <Textarea
                    id="volunteerWork"
                    placeholder="Gönüllü çalışmaları ve topluluk deneyimleri..."
                    value={formData.volunteerWork}
                    onChange={(e) => handleInputChange('volunteerWork', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Kritik Yaşam Deneyimleri */}
              <TabsContent value="experience" className="space-y-4 relative z-40">
                <div>
                  <Label htmlFor="turningPoints">Hayatındaki Dönüm Noktaları</Label>
                  <Textarea
                    id="turningPoints"
                    placeholder="Şirket kurma, iş değiştirme, ülke değiştirme gibi dönüm noktaları..."
                    value={formData.turningPoints}
                    onChange={(e) => handleInputChange('turningPoints', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="challenges">Karşılaştığı Büyük Zorluklar</Label>
                  <Textarea
                    id="challenges"
                    placeholder="Karşılaştığı zorluklar ve nasıl aştığı..."
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="lessons">Öğrendiği En Büyük Dersler</Label>
                  <Textarea
                    id="lessons"
                    placeholder="Hayattan öğrendiği en önemli dersler..."
                    value={formData.lessons}
                    onChange={(e) => handleInputChange('lessons', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* İleriye Dönük Planlar */}
              <TabsContent value="future" className="space-y-4 relative z-40">
                <div>
                  <Label htmlFor="futureGoals">5-10 Yıllık Hedefleri</Label>
                  <Textarea
                    id="futureGoals"
                    placeholder="Gelecek planları ve hedefleri..."
                    value={formData.futureGoals}
                    onChange={(e) => handleInputChange('futureGoals', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="businessIdeas">Yeni İş Fikirlerine Yaklaşımı</Label>
                  <Textarea
                    id="businessIdeas"
                    placeholder="İş fikirlerine nasıl yaklaştığı..."
                    value={formData.businessIdeas}
                    onChange={(e) => handleInputChange('businessIdeas', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="investmentInterest"
                    checked={formData.investmentInterest}
                    onCheckedChange={(checked) => handleInputChange('investmentInterest', checked)}
                  />
                  <Label htmlFor="investmentInterest">Yatırım yapma / ortaklık kurma isteği var</Label>
                </div>

                <div>
                  <Label htmlFor="collaborationAreas">İş Birliği Yapmak İstediği Alanlar</Label>
                  <Textarea
                    id="collaborationAreas"
                    placeholder="Hangi alanlarda iş birliği yapmak istediği..."
                    value={formData.collaborationAreas}
                    onChange={(e) => handleInputChange('collaborationAreas', e.target.value)}
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Card */}
            {formData.name && (
              <Card className="p-4 bg-white/5 border-white/10">
                <div className="flex items-center gap-3">
                  <Avatar
                    alt={formData.name}
                    fallback={formData.name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{formData.name}</div>
                    {formData.role && (
                      <div className="text-sm text-muted-foreground">{formData.role}</div>
                    )}
                    {formData.company && (
                      <div className="text-sm text-muted-foreground">{formData.company}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {selectedCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedCategory.label}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Yakınlık: {formData.closeness}/10
                      </Badge>
                      {formData.expertise.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {formData.expertise.length} Uzmanlık
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Ekleniyor...' : 'Kişi Ekle'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Dialog open={open || false} onOpenChange={onOpenChange}>
          <DialogContent className="glass backdrop-blur-sm border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="gradient-text flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {variant === 'quick' ? 'Hızlı Kişi Ekle' : 'Yeni Kişi Ekle'}
              </DialogTitle>
            </DialogHeader>

            {/* Same form content as above */}
            {/* ... */}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
