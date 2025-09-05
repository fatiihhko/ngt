import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
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
  Mail,
  Sparkles,
  Rocket,
  Crown,
  Gem,
  Palette,
  Music,
  Camera,
  Coffee,
  Gamepad2,
  HeartHandshake,
  Globe2,
  Brain,
  Trophy,
  Compass,
  Sunrise,
  Moon,
  MessageSquare,
  RefreshCw,
  ChevronDown
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
  { value: 'work', label: '💼 İş', icon: Building2, color: 'bg-blue-500' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Aile', icon: Home, color: 'bg-rose-500' },
  { value: 'friend', label: '🤝 Arkadaş', icon: Heart, color: 'bg-green-500' },
  { value: 'other', label: '✨ Diğer', icon: MoreHorizontal, color: 'bg-slate-500' },
];

const sectorOptions = [
  '💻 Teknoloji', '💰 Finans', '🏥 Sağlık', '🎓 Eğitim', '📈 Pazarlama', '🎨 Tasarım', 
  '⚙️ Mühendislik', '⚖️ Hukuk', '💡 Danışmanlık', '🏭 Üretim', '🛍️ Perakende', '🛒 E-ticaret',
  '📺 Medya', '✈️ Turizm', '🏗️ İnşaat', '⚡ Enerji', '✨ Diğer'
];

const expertiseOptions = [
  '💻 Yazılım Geliştirme', '🎨 UI/UX Tasarım', '📈 Pazarlama', '💰 Satış', '🏦 Finans',
  '👥 İnsan Kaynakları', '⚙️ Operasyon', '🎯 Strateji', '🔬 Araştırma', '📚 Eğitim',
  '💡 Danışmanlık', '✍️ Yaratıcı İçerik', '📊 Veri Analizi', '📋 Proje Yönetimi',
  '🎧 Müşteri Hizmetleri', '🚚 Lojistik', '✅ Kalite Kontrol', '✨ Diğer'
];

const serviceOptions = [
  '🌐 Web Tasarım', '📱 Mobil Uygulama', '🎨 Grafik Tasarım', '📈 Dijital Pazarlama',
  '🔍 SEO', '📱 Sosyal Medya Yönetimi', '✍️ İçerik Yazarlığı', '🎬 Video Prodüksiyon',
  '📊 Muhasebe', '⚖️ Hukuki Danışmanlık', '👥 İK Danışmanlığı', '🎯 Strateji Danışmanlığı',
  '📚 Eğitim', '🎯 Koçluk', '🌟 Mentorluk', '💼 Yatırım Danışmanlığı', '✨ Diğer'
];

const languageOptions = [
  '🇹🇷 Türkçe', '🇬🇧 İngilizce', '🇩🇪 Almanca', '🇫🇷 Fransızca', '🇪🇸 İspanyolca', '🇮🇹 İtalyanca',
  '🇷🇺 Rusça', '🇸🇦 Arapça', '🇨🇳 Çince', '🇯🇵 Japonca', '🇰🇷 Korece', '✨ Diğer'
];

const personalTraits = [
  { id: 'honesty', label: '🤝 Dürüstlük', icon: Shield },
  { id: 'reliability', label: '✅ Güvenilirlik', icon: CheckCircle },
  { id: 'discipline', label: '🎯 Disiplin', icon: Target },
  { id: 'hardworking', label: '💪 Çalışkanlık', icon: Zap },
  { id: 'patience', label: '😌 Sabırlılık', icon: Heart },
  { id: 'leadership', label: '👑 Liderlik', icon: Crown },
  { id: 'teamwork', label: '🤝 Takım Çalışması', icon: Users },
  { id: 'communication', label: '💬 İletişim Becerisi', icon: MessageSquare },
  { id: 'creativity', label: '🎨 Yaratıcılık', icon: Palette },
  { id: 'adaptability', label: '🔄 Uyum Yeteneği', icon: RefreshCw }
];

const values = [
  '⚖️ Etik', '🌱 Sürdürülebilirlik', '🤝 Topluma Fayda', '💡 İnovasyon', '⭐ Kalite',
  '🎯 Müşteri Odaklılık', '📚 Sürekli Öğrenme', '🔍 Şeffaflık', '⚖️ Adalet', '❤️ Empati'
];

const interests = [
  { value: 'spor', label: '🏃‍♂️ Spor', icon: Trophy },
  { value: 'seyahat', label: '✈️ Seyahat', icon: Globe },
  { value: 'kitap', label: '📚 Kitap Okuma', icon: BookOpen },
  { value: 'teknoloji', label: '💻 Teknoloji', icon: Zap },
  { value: 'muzik', label: '🎵 Müzik', icon: Music },
  { value: 'sanat', label: '🎨 Sanat', icon: Palette },
  { value: 'yemek', label: '👨‍🍳 Yemek Yapma', icon: Coffee },
  { value: 'fotograf', label: '📸 Fotoğrafçılık', icon: Camera },
  { value: 'bahce', label: '🌱 Bahçıvanlık', icon: Heart },
  { value: 'koleksiyon', label: '💎 Koleksiyon', icon: Gem },
  { value: 'oyun', label: '🎮 Oyun', icon: Gamepad2 },
  { value: 'dans', label: '💃 Dans', icon: HeartHandshake },
  { value: 'yoga', label: '🧘‍♀️ Yoga', icon: Brain },
  { value: 'meditasyon', label: '🧘‍♂️ Meditasyon', icon: Target },
  { value: 'gonullu', label: '🤝 Gönüllülük', icon: HeartHandshake },
  { value: 'diger', label: '✨ Diğer', icon: Sparkles }
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
  const [sendEmail, setSendEmail] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Get current user ID and contact ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
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
    customSectors: [] as string[],
    workExperience: '',
    expertise: [] as string[],
    customExpertise: [] as string[],
    services: [] as string[],
    customServices: [] as string[],
    category: 'work' as const,
    closeness: 5 as const,
    personalTraits: [] as string[],
    values: [] as string[],
    goals: '',
    vision: '',
    interests: [] as string[],
    languages: [] as string[],
    customLanguages: [] as string[],
    isMentor: false,
    volunteerWork: '',
    turningPoints: '',
    challenges: '',
    lessons: '',
    futureGoals: '',
    investmentInterest: false,
    collaborationAreas: '',
    email: '',
    phone: '',
    description: ''
  });

  // State for showing custom input fields
  const [showCustomSector, setShowCustomSector] = useState(false);
  const [showCustomExpertise, setShowCustomExpertise] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);
  const [showCustomLanguage, setShowCustomLanguage] = useState(false);

  // State for custom input values
  const [customSectorInput, setCustomSectorInput] = useState('');
  const [customExpertiseInput, setCustomExpertiseInput] = useState('');
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [customLanguageInput, setCustomLanguageInput] = useState('');

  const steps = [
    { id: 'basic', label: '👤 Temel Bilgiler', icon: User, progress: 0 },
    { id: 'professional', label: '💼 İş Bilgileri', icon: Briefcase, progress: 20 },
    { id: 'personal', label: '🎯 Kişisel Özellikler', icon: Target, progress: 40 },
    { id: 'social', label: '🤝 Sosyal', icon: Users, progress: 60 },
    { id: 'experience', label: '🏆 Deneyim', icon: Award, progress: 80 },
    { id: 'future', label: '🚀 Gelecek', icon: Rocket, progress: 100 }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSubmit = async () => {
    // Zorunlu alanlar kontrolü
    if (!formData.name.trim()) {
      toast({
        title: "Hata",
        description: "Ad Soyad alanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role.trim()) {
      toast({
        title: "Hata",
        description: "Pozisyon alanı zorunludur.",
        variant: "destructive"
      });
      return;
    }

    // E-posta veya telefon kontrolü (ikisinden biri mutlaka olmalı)
    if (!formData.email.trim() && !formData.phone.trim()) {
      toast({
        title: "Hata",
        description: "E-posta veya telefon bilgilerinden en az biri girilmelidir.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (inviteToken && inviteToken.trim() !== '') {
        const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
        const lastName = lastNameParts.join(' ') || '';
        
        const shouldUseInviteLinkEndpoint = isInviteLink || window.location.pathname.includes('/invite-link/');
        const endpoint = shouldUseInviteLinkEndpoint 
          ? 'https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/invite-link-submit'
          : 'https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/invite-submit-new';
        
        console.log('AddPersonModal: Making request to:', endpoint);
        console.log('AddPersonModal: Request body:', JSON.stringify({
          token: inviteToken,
          sendEmail: sendEmail,
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
            age: formData.age || undefined,
            birth_city: formData.birthCity.trim() || undefined,
            current_city: formData.currentCity.trim() || undefined,
            education_school: formData.education.school || undefined,
            education_department: formData.education.department || undefined,
            education_degree: formData.education.degree || undefined,
            education_graduation_year: formData.education.graduationYear || undefined,
            company: formData.company.trim() || undefined,
            sectors: [...formData.sectors.filter(s => s !== '✨ Diğer'), ...formData.customSectors],
            work_experience: formData.workExperience.trim() || undefined,
            expertise: [...formData.expertise.filter(e => e !== '✨ Diğer'), ...formData.customExpertise],
            services: [...formData.services.filter(s => s !== '✨ Diğer'), ...formData.customServices],
            personal_traits: formData.personalTraits,
            values: formData.values,
            goals: formData.goals.trim() || undefined,
            vision: formData.vision.trim() || undefined,
            languages: [...formData.languages.filter(l => l !== '✨ Diğer'), ...formData.customLanguages],
            is_mentor: formData.isMentor,
            volunteer_work: formData.volunteerWork.trim() || undefined,
            turning_points: formData.turningPoints.trim() || undefined,
            challenges: formData.challenges.trim() || undefined,
            lessons: formData.lessons.trim() || undefined,
            future_goals: formData.futureGoals.trim() || undefined,
            investment_interest: formData.investmentInterest,
            collaboration_areas: formData.collaborationAreas.trim() || undefined,
          },
        }, null, 2));

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzcW5uYXNzZ2JpaG5yamtjZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQzOTQsImV4cCI6MjA3MDQwMDM5NH0.quHEwhAvPUi8QinNJM4dTnN7MQXlmHKAt0BpYnNosoc'
          },
          body: JSON.stringify({
            token: inviteToken,
            sendEmail: sendEmail,
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
              age: formData.age || undefined,
              birth_city: formData.birthCity.trim() || undefined,
              current_city: formData.currentCity.trim() || undefined,
              education_school: formData.education.school || undefined,
              education_department: formData.education.department || undefined,
              education_degree: formData.education.degree || undefined,
              education_graduation_year: formData.education.graduationYear || undefined,
              company: formData.company.trim() || undefined,
              sectors: [...formData.sectors.filter(s => s !== '✨ Diğer'), ...formData.customSectors],
              work_experience: formData.workExperience.trim() || undefined,
              expertise: [...formData.expertise.filter(e => e !== '✨ Diğer'), ...formData.customExpertise],
              services: [...formData.services.filter(s => s !== '✨ Diğer'), ...formData.customServices],
              personal_traits: formData.personalTraits,
              values: formData.values,
              goals: formData.goals.trim() || undefined,
              vision: formData.vision.trim() || undefined,
              languages: [...formData.languages.filter(l => l !== '✨ Diğer'), ...formData.customLanguages],
              is_mentor: formData.isMentor,
              volunteer_work: formData.volunteerWork.trim() || undefined,
              turning_points: formData.turningPoints.trim() || undefined,
              challenges: formData.challenges.trim() || undefined,
              lessons: formData.lessons.trim() || undefined,
              future_goals: formData.futureGoals.trim() || undefined,
              investment_interest: formData.investmentInterest,
              collaboration_areas: formData.collaborationAreas.trim() || undefined,
            },
          })
        });

        console.log('AddPersonModal: Response status:', response.status);
        console.log('AddPersonModal: Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('AddPersonModal: Error response text:', errorText);
          const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
          toast({ title: "Kaydedilemedi", description: errorData.error || `HTTP ${response.status}`, variant: "destructive" });
          return;
        }

        const data = await response.json();
        console.log('AddPersonModal: Success response data:', data);
        console.log('AddPersonModal: data.result:', data.result);
        console.log('AddPersonModal: data.result.contact_id:', data.result?.contact_id);
        console.log('AddPersonModal: Data success field:', data.success);
        console.log('AddPersonModal: Data type:', typeof data.success);
        console.log('AddPersonModal: All data keys:', Object.keys(data));

        // Check if the response indicates success
        if (!data.success) {
          console.log('AddPersonModal: Success check failed, showing error');
          const errorMessage = data.error || "Kişi eklenirken beklenmeyen bir hata oluştu";
          toast({ title: "Hata", description: errorMessage, variant: "destructive" });
          return;
        }

        console.log('AddPersonModal: Success check passed, proceeding with success flow');
        console.log('AddPersonModal: data.result:', data.result);
        console.log('AddPersonModal: data.contact_id:', data.contact_id);
        console.log('AddPersonModal: formData.name:', formData.name);
        console.log('AddPersonModal: firstName:', firstName);
        console.log('AddPersonModal: lastName:', lastName);
        
        const newPerson = {
          id: data.result?.contact_id || data.contact_id,
          name: formData.name.trim(),
          first_name: firstName,
          last_name: lastName,
          age: formData.age || undefined,
          birthCity: formData.birthCity.trim() || undefined,
          currentCity: formData.currentCity.trim() || undefined,
          education: formData.education,
          company: formData.company.trim() || undefined,
          sectors: formData.customSectors ? [...formData.sectors.filter(s => s !== 'Diğer'), formData.customSectors] : formData.sectors,
          customSector: formData.customSectors || undefined,
          workExperience: formData.workExperience.trim() || undefined,
          expertise: formData.customExpertise ? [...formData.expertise.filter(e => e !== 'Diğer'), formData.customExpertise] : formData.expertise,
          customExpertise: formData.customExpertise || undefined,
          services: formData.customServices ? [...formData.services.filter(s => s !== 'Diğer'), formData.customServices] : formData.services,
          customService: formData.customServices || undefined,
          personalTraits: formData.personalTraits,
          values: formData.values,
          goals: formData.goals.trim() || undefined,
          vision: formData.vision.trim() || undefined,
          languages: formData.customLanguages ? [...formData.languages.filter(l => l !== 'Diğer'), formData.customLanguages] : formData.languages,
          customLanguage: formData.customLanguages || undefined,
          isMentor: formData.isMentor,
          volunteerWork: formData.volunteerWork.trim() || undefined,
          turningPoints: formData.turningPoints.trim() || undefined,
          challenges: formData.challenges.trim() || undefined,
          lessons: formData.lessons.trim() || undefined,
          futureGoals: formData.futureGoals.trim() || undefined,
          investmentInterest: formData.investmentInterest,
          collaborationAreas: formData.collaborationAreas.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          description: formData.description.trim() || undefined,
          role: formData.role.trim() || undefined,
          city: formData.currentCity.trim() || undefined,
          category: formData.category,
          closeness: formData.closeness,
          parent_contact_id: parentContactId || null,
        };
        
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

        console.log('AddPersonModal: About to call onSuccess with:', newPerson);
        console.log('AddPersonModal: onSuccess function exists:', !!onSuccess);
        onSuccess?.(newPerson);
        console.log('AddPersonModal: onSuccess called successfully');
        
        console.log('AddPersonModal: About to call onClose');
        onClose();
        console.log('AddPersonModal: onClose called successfully');
        
        console.log('AddPersonModal: About to call onOpenChange');
        onOpenChange?.(false);
        console.log('AddPersonModal: onOpenChange called successfully');
        
        console.log('AddPersonModal: About to dispatch contacts:refresh event');
        window.dispatchEvent(new CustomEvent("contacts:refresh"));
        console.log('AddPersonModal: contacts:refresh event dispatched successfully');
        
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
          customSectors: [],
          workExperience: '',
          expertise: [],
          customExpertise: [],
          services: [],
          customServices: [],
          category: 'work',
          closeness: 5,
          personalTraits: [],
          values: [],
          goals: '',
          vision: '',
          interests: [],
          languages: [],
          customLanguages: [],
          isMentor: false,
          volunteerWork: '',
          turningPoints: '',
          challenges: '',
          lessons: '',
          futureGoals: '',
          investmentInterest: false,
          collaborationAreas: '',
          email: '',
          phone: '',
          description: '',
        });
        
        // Return early to avoid executing the normal flow
        return;
      } else {
        const newPerson = await addPerson({
          name: formData.name.trim(),
          age: formData.age || undefined,
          birthCity: formData.birthCity.trim() || undefined,
          currentCity: formData.currentCity.trim() || undefined,
          education: formData.education,
          role: formData.role.trim() || undefined,
          company: formData.company.trim() || undefined,
          sectors: [...formData.sectors.filter(s => s !== '✨ Diğer'), ...formData.customSectors],
          workExperience: formData.workExperience.trim() || undefined,
          expertise: [...formData.expertise.filter(e => e !== '✨ Diğer'), ...formData.customExpertise],
          services: [...formData.services.filter(s => s !== '✨ Diğer'), ...formData.customServices],
          category: formData.category,
          closeness: formData.closeness,
          personalTraits: formData.personalTraits,
          values: formData.values,
          goals: formData.goals.trim() || undefined,
          vision: formData.vision.trim() || undefined,
          languages: [...formData.languages.filter(l => l !== '✨ Diğer'), ...formData.customLanguages],
          isMentor: formData.isMentor,
          volunteerWork: formData.volunteerWork.trim() || undefined,
          turningPoints: formData.turningPoints.trim() || undefined,
          challenges: formData.challenges.trim() || undefined,
          lessons: formData.lessons.trim() || undefined,
          futureGoals: formData.futureGoals.trim() || undefined,
          investmentInterest: formData.investmentInterest,
          collaborationAreas: formData.collaborationAreas.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          description: formData.description.trim() || undefined,
          parent_contact_id: currentContactId || null,
        });

        toast({
          title: "Başarılı",
          description: `${newPerson.name} başarıyla eklendi.`
        });

        console.log('AddPersonModal: About to call onSuccess (normal flow) with:', newPerson);
        console.log('AddPersonModal: onSuccess function exists (normal flow):', !!onSuccess);
        onSuccess?.(newPerson);
        console.log('AddPersonModal: onSuccess (normal flow) called successfully');
        onOpenChange?.(false);
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
          category: 'work',
          closeness: 5,
          personalTraits: [],
          values: [],
          goals: '',
          vision: '',
          interests: [],
          languages: [],
          customLanguage: '',
          isMentor: false,
          volunteerWork: '',
          turningPoints: '',
          challenges: '',
          lessons: '',
          futureGoals: '',
          investmentInterest: false,
          collaborationAreas: '',
          email: '',
          phone: '',
          description: '',
        });
      }
    } catch (error) {
      console.error('AddPersonModal: Error in handleSubmit:', error);
      
      // Only show error toast if it's not an inviteToken flow
      if (!inviteToken) {
        toast({
          title: "Hata",
          description: "Kişi eklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
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

  const handleCustomInput = (type: 'sector' | 'expertise' | 'service' | 'language', input: string) => {
    if (!input.trim()) return;
    
    const items = input.split(',').map(item => item.trim()).filter(item => item.length > 0);
    
    setFormData(prev => {
      const fieldMap = {
        sector: 'customSectors',
        expertise: 'customExpertise', 
        service: 'customServices',
        language: 'customLanguages'
      } as const;
      
      const field = fieldMap[type];
      const currentArray = prev[field] as string[];
      const newItems = items.filter(item => !currentArray.includes(item));
      
      return {
        ...prev,
        [field]: [...currentArray, ...newItems]
      };
    });

    // Clear input
    const setterMap = {
      sector: setCustomSectorInput,
      expertise: setCustomExpertiseInput,
      service: setCustomServiceInput,
      language: setCustomLanguageInput
    };
    setterMap[type]('');
  };

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category);

  const nextStep = () => {
    console.log('nextStep called, currentStep:', currentStep, 'steps.length:', steps.length);
    if (currentStep < steps.length - 1) {
      console.log('Moving to next step:', currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    console.log('prevStep called, currentStep:', currentStep);
    if (currentStep > 0) {
      console.log('Moving to previous step:', currentStep - 1);
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {variant === 'default' ? (
        <div className="space-y-6 relative z-30">
          {/* Header with Enhanced Animation */}
          <motion.div 
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"
              >
                <UserPlus className="h-8 w-8 text-primary" />
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Yeni Kişi Ekle
              </motion.h2>
            </div>
            <motion.p 
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Ağınıza yeni bir bağlantı ekleyin ✨
            </motion.p>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Enhanced Progress Bar and Navigation */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Progress Bar */}
            <div className="space-y-3">
              <motion.div 
                className="flex justify-between text-sm text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.span
                  key={`step-${currentStep}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary"
                >
                  Adım {currentStep + 1} / {steps.length}
                </motion.span>
                <motion.span
                  key={`progress-${progress}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-primary"
                >
                  {Math.round(progress)}% Tamamlandı
                </motion.span>
              </motion.div>
              
              <div className="relative">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                >
                  <Progress value={progress} className="h-3" />
                </motion.div>
                
                <div className="absolute inset-0 flex justify-between items-center px-2">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 ${
                        index <= currentStep 
                          ? 'bg-primary border-primary' 
                          : 'bg-background border-muted-foreground'
                      }`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ 
                        scale: index <= currentStep ? 1.2 : 1, 
                        rotate: 0,
                        boxShadow: index <= currentStep 
                          ? "0 0 10px rgba(59, 130, 246, 0.5)" 
                          : "none"
                      }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.5 + index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ scale: 1.3 }}
                    />
                  ))}
                </div>
              </div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <motion.span 
                  className="text-lg font-medium text-primary"
                  key={`label-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {currentStepData.label}
                </motion.span>
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <motion.div 
              className="flex justify-between items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  ← Önceki Adım
                </Button>
              </motion.div>
              
              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Sonraki Adım →
                      </motion.span>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Clock className="h-4 w-4" />
                          </motion.div>
                          <motion.span
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            Ekleniyor...
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ 
                              scale: [1, 1.2, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              repeatDelay: 3,
                              ease: "easeInOut"
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </motion.div>
                          <motion.span
                            animate={{ 
                              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                            }}
                            transition={{ 
                              duration: 3, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="bg-gradient-to-r from-white via-yellow-200 to-white bg-[length:200%_100%] bg-clip-text text-transparent"
                          >
                            Kişi Ekle
                          </motion.span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Step Indicators */}
            <div className="flex justify-center">
              <div className="flex gap-1">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      currentStep === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/10 text-muted-foreground hover:bg-white/20'
                    }`}
                    title={step.label}
                  >
                    <step.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 1: Basic Information */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold">👤 Temel Bilgiler</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2">
                            <span className="text-red-500">*</span>
                            Ad Soyad
                          </Label>
                          <Input
                            id="name"
                            placeholder="Ad Soyad"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className={`bg-white/5 border-white/20 focus:border-blue-400 ${
                              !formData.name.trim() ? 'border-red-400' : ''
                            }`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">Yaş</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="25"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            className="bg-white/5 border-white/20 focus:border-blue-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthCity">🏠 Nereli</Label>
                          <Input
                            id="birthCity"
                            placeholder="İstanbul"
                            value={formData.birthCity}
                            onChange={(e) => handleInputChange('birthCity', e.target.value)}
                            className="bg-white/5 border-white/20 focus:border-blue-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currentCity">📍 Şu An Yaşadığı Şehir</Label>
                          <Input
                            id="currentCity"
                            placeholder="İstanbul"
                            value={formData.currentCity}
                            onChange={(e) => handleInputChange('currentCity', e.target.value)}
                            className="bg-white/5 border-white/20 focus:border-blue-400"
                          />
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Education Section */}
                      <div className="space-y-4">
                        <Label className="flex items-center gap-2 text-lg font-medium">
                          <GraduationCap className="h-5 w-5 text-green-500" />
                          🎓 Eğitim Geçmişi
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="school">Okul/Üniversite</Label>
                            <Input
                              id="school"
                              placeholder="Boğaziçi Üniversitesi"
                              value={formData.education.school}
                              onChange={(e) => handleEducationChange('school', e.target.value)}
                              className="bg-white/5 border-white/20 focus:border-green-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="department">Bölüm</Label>
                            <Input
                              id="department"
                              placeholder="Bilgisayar Mühendisliği"
                              value={formData.education.department}
                              onChange={(e) => handleEducationChange('department', e.target.value)}
                              className="bg-white/5 border-white/20 focus:border-green-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="degree">Derece</Label>
                            <Input
                              id="degree"
                              placeholder="Lisans"
                              value={formData.education.degree}
                              onChange={(e) => handleEducationChange('degree', e.target.value)}
                              className="bg-white/5 border-white/20 focus:border-green-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="graduationYear">Mezuniyet Yılı</Label>
                            <Input
                              id="graduationYear"
                              type="number"
                              placeholder="2020"
                              value={formData.education.graduationYear}
                              onChange={(e) => handleEducationChange('graduationYear', e.target.value)}
                              className="bg-white/5 border-white/20 focus:border-green-400"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Contact Information */}
                                              <div className="space-y-4">
                          <Label className="flex items-center gap-2 text-lg font-medium">
                            <Mail className="h-5 w-5 text-purple-500" />
                            📧 İletişim Bilgileri
                            <span className="text-sm text-muted-foreground">(E-posta veya telefon gerekli)</span>
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email">E-posta</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="ornek@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`bg-white/5 border-white/20 focus:border-purple-400 ${
                                  !formData.email.trim() && !formData.phone.trim() ? 'border-yellow-400' : ''
                                }`}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefon</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+90 5XX XXX XX XX"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className={`bg-white/5 border-white/20 focus:border-purple-400 ${
                                  !formData.email.trim() && !formData.phone.trim() ? 'border-yellow-400' : ''
                                }`}
                              />
                            </div>
                          </div>
                          {!formData.email.trim() && !formData.phone.trim() && (
                            <p className="text-sm text-yellow-400">
                              ⚠️ E-posta veya telefon bilgilerinden en az biri girilmelidir.
                            </p>
                          )}
                        </div>

                      <Separator className="my-6" />

                      {/* General Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">📝 Genel Açıklama</Label>
                        <Textarea
                          id="description"
                          placeholder="Kişi hakkında genel notlar..."
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={3}
                          className="bg-white/5 border-white/20 focus:border-blue-400"
                        />
                      </div>

                      {/* Email sending option for invite flow */}
                      {inviteToken && (
                        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg mt-4">
                          <input
                            type="checkbox"
                            id="sendEmail"
                            checked={sendEmail}
                            onChange={(e) => setSendEmail(e.target.checked)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="sendEmail" className="text-sm text-muted-foreground">
                            📧 Kişiye e-posta göndermek ister misiniz?
                          </label>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Professional Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Briefcase className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold">💼 İş ve Profesyonel Bilgiler</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="flex items-center gap-2">
                            <span className="text-red-500">*</span>
                            👔 Pozisyon
                          </Label>
                          <Input
                            id="role"
                            placeholder="Senior Frontend Developer"
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            required
                            className={`bg-white/5 border-white/20 focus:border-green-400 ${
                              !formData.role.trim() ? 'border-red-400' : ''
                            }`}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company">🏢 Şirket</Label>
                          <Input
                            id="company"
                            placeholder="Google"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            className="bg-white/5 border-white/20 focus:border-green-400"
                          />
                        </div>
                      </div>

                      {/* Sectors */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">🏭 Sektörler</Label>
                        
                        {/* Selected Sectors as Bubbles */}
                        {(formData.sectors.length > 0 || formData.customSectors.length > 0) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.sectors.map((sector) => (
                              <motion.div
                                key={sector}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30"
                              >
                                <span>{sector}</span>
                                <button
                                  type="button"
                                  onClick={() => handleArrayChange('sectors', sector, 'remove')}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                            {formData.customSectors.map((sector) => (
                              <motion.div
                                key={sector}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600/30 text-blue-200 rounded-full text-sm border border-blue-500/40"
                              >
                                <span>✨ {sector}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      customSectors: prev.customSectors.filter(s => s !== sector)
                                    }));
                                  }}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Dropdown */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10"
                            >
                              <span className="text-muted-foreground">
                                {formData.sectors.length > 0 
                                  ? `${formData.sectors.length} sektör seçildi` 
                                  : "Sektör seçin..."}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm border-white/20">
                            <Command>
                              <CommandInput placeholder="Sektör ara..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>Sektör bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  {sectorOptions.map((sector) => (
                                    <CommandItem
                                      key={sector}
                                      onSelect={() => {
                                        if (sector === '✨ Diğer') {
                                          setShowCustomSector(!showCustomSector);
                                        } else {
                                          const isSelected = formData.sectors.includes(sector);
                                          handleArrayChange('sectors', sector, isSelected ? 'remove' : 'add');
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={sector === '✨ Diğer' ? showCustomSector : formData.sectors.includes(sector)}
                                        className="mr-2"
                                      />
                                      {sector}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Custom Sector Input */}
                        {showCustomSector && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            <Label className="text-sm text-muted-foreground">
                              ✨ Özel sektörler (virgülle ayırarak birden fazla girebilirsiniz)
                            </Label>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Örn: Blockchain, Yapay Zeka, Fintech..."
                                value={customSectorInput}
                                onChange={(e) => setCustomSectorInput(e.target.value)}
                                className="flex-1 bg-white/5 border-white/20 focus:border-blue-400"
                                rows={2}
                              />
                              <Button
                                type="button"
                                onClick={() => handleCustomInput('sector', customSectorInput)}
                                className="px-4"
                              >
                                Ekle
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Expertise */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">🎯 Uzmanlık Alanları</Label>
                        
                        {/* Selected Expertise as Bubbles */}
                        {(formData.expertise.length > 0 || formData.customExpertise.length > 0) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.expertise.map((expertise) => (
                              <motion.div
                                key={expertise}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-400/30"
                              >
                                <span>{expertise}</span>
                                <button
                                  type="button"
                                  onClick={() => handleArrayChange('expertise', expertise, 'remove')}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                            {formData.customExpertise.map((expertise) => (
                              <motion.div
                                key={expertise}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-green-600/30 text-green-200 rounded-full text-sm border border-green-500/40"
                              >
                                <span>✨ {expertise}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      customExpertise: prev.customExpertise.filter(e => e !== expertise)
                                    }));
                                  }}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* Dropdown */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10"
                            >
                              <span className="text-muted-foreground">
                                {formData.expertise.length > 0 
                                  ? `${formData.expertise.length} uzmanlık seçildi` 
                                  : "Uzmanlık alanı seçin..."}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm border-white/20">
                            <Command>
                              <CommandInput placeholder="Uzmanlık ara..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>Uzmanlık bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  {expertiseOptions.map((expertise) => (
                                    <CommandItem
                                      key={expertise}
                                      onSelect={() => {
                                        if (expertise === '✨ Diğer') {
                                          setShowCustomExpertise(!showCustomExpertise);
                                        } else {
                                          const isSelected = formData.expertise.includes(expertise);
                                          handleArrayChange('expertise', expertise, isSelected ? 'remove' : 'add');
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={expertise === '✨ Diğer' ? showCustomExpertise : formData.expertise.includes(expertise)}
                                        className="mr-2"
                                      />
                                      {expertise}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Custom Expertise Input */}
                        {showCustomExpertise && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            <Label className="text-sm text-muted-foreground">
                              ✨ Özel uzmanlık alanları (virgülle ayırarak birden fazla girebilirsiniz)
                            </Label>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Örn: React Native, Blockchain, AI/ML..."
                                value={customExpertiseInput}
                                onChange={(e) => setCustomExpertiseInput(e.target.value)}
                                className="flex-1 bg-white/5 border-white/20 focus:border-green-400"
                                rows={2}
                              />
                              <Button
                                type="button"
                                onClick={() => handleCustomInput('expertise', customExpertiseInput)}
                                className="px-4"
                              >
                                Ekle
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Services */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">🛠️ Verebileceği Hizmetler</Label>
                        
                        {/* Selected Services as Bubbles */}
                        {(formData.services.length > 0 || formData.customServices.length > 0) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.services.map((service) => (
                              <motion.div
                                key={service}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30"
                              >
                                <span>{service}</span>
                                <button
                                  type="button"
                                  onClick={() => handleArrayChange('services', service, 'remove')}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                            {formData.customServices.map((service) => (
                              <motion.div
                                key={service}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm border border-purple-500/40"
                              >
                                <span>✨ {service}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      customServices: prev.customServices.filter(s => s !== service)
                                    }));
                                  }}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* Dropdown */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10"
                            >
                              <span className="text-muted-foreground">
                                {formData.services.length > 0 
                                  ? `${formData.services.length} hizmet seçildi` 
                                  : "Hizmet seçin..."}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm border-white/20">
                            <Command>
                              <CommandInput placeholder="Hizmet ara..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>Hizmet bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  {serviceOptions.map((service) => (
                                    <CommandItem
                                      key={service}
                                      onSelect={() => {
                                        if (service === '✨ Diğer') {
                                          setShowCustomService(!showCustomService);
                                        } else {
                                          const isSelected = formData.services.includes(service);
                                          handleArrayChange('services', service, isSelected ? 'remove' : 'add');
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={service === '✨ Diğer' ? showCustomService : formData.services.includes(service)}
                                        className="mr-2"
                                      />
                                      {service}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Custom Service Input */}
                        {showCustomService && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            <Label className="text-sm text-muted-foreground">
                              ✨ Özel hizmetler (virgülle ayırarak birden fazla girebilirsiniz)
                            </Label>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Örn: Web Tasarım, SEO, Sosyal Medya Yönetimi..."
                                value={customServiceInput}
                                onChange={(e) => setCustomServiceInput(e.target.value)}
                                className="flex-1 bg-white/5 border-white/20 focus:border-purple-400"
                                rows={2}
                              />
                              <Button
                                type="button"
                                onClick={() => handleCustomInput('service', customServiceInput)}
                                className="px-4"
                              >
                                Ekle
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Work Experience */}
                      <div className="space-y-2">
                        <Label htmlFor="workExperience">📋 İş Deneyimi (Kısa Notlar)</Label>
                        <Textarea
                          id="workExperience"
                          placeholder="Önceki iş deneyimleri, projeler, başarılar..."
                          value={formData.workExperience}
                          onChange={(e) => handleInputChange('workExperience', e.target.value)}
                          rows={3}
                          className="bg-white/5 border-white/20 focus:border-green-400"
                        />
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 3: Personal Characteristics */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Target className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold">🎯 Kişisel Özellikler</h3>
                      </div>

                      {/* Category and Closeness */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <Label className="text-lg font-medium">📂 Kategori</Label>
                          <div className="grid grid-cols-2 gap-3">
                            {categoryOptions.map((option) => {
                              const Icon = option.icon;
                              const isSelected = formData.category === option.value;
                              
                              return (
                                <motion.div
                                  key={option.value}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                                      isSelected ? option.color : 'bg-white/10 border-white/20 hover:bg-white/20'
                                    }`}
                                    onClick={() => handleInputChange('category', option.value)}
                                  >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-sm">{option.label}</span>
                                  </Button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-lg font-medium">❤️ Yakınlık Seviyesi</Label>
                          <div className="space-y-4">
                            <Slider
                              value={[formData.closeness]}
                              onValueChange={(value) => handleInputChange('closeness', value[0])}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Uzak (1)</span>
                              <Badge variant="secondary" className="text-sm">
                                {formData.closeness}/10
                              </Badge>
                              <span>Yakın (10)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Personal Traits */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">🌟 Kişisel Özellikler</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {personalTraits.map((trait) => (
                            <motion.div
                              key={trait.id}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                            >
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
                              <Label htmlFor={trait.id} className="text-sm cursor-pointer">
                                {trait.label}
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Values */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">💎 Değer Verdiği Prensipler</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {values.map((value) => (
                            <motion.div
                              key={value}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                type="button"
                                variant={formData.values.includes(value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleArrayChange('values', value, formData.values.includes(value) ? 'remove' : 'add')}
                                className="w-full h-auto p-3 text-sm"
                              >
                                {value}
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      {/* Goals and Vision */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="goals">🎯 Hedefleri</Label>
                          <Textarea
                            id="goals"
                            placeholder="Kısa ve uzun vadeli hedefleri..."
                            value={formData.goals}
                            onChange={(e) => handleInputChange('goals', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vision">🔮 Vizyonu</Label>
                          <Textarea
                            id="vision"
                            placeholder="Kişisel vizyonu ve misyonu..."
                            value={formData.vision}
                            onChange={(e) => handleInputChange('vision', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-purple-400"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 4: Social and Networking */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Users className="h-5 w-5 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-semibold">🤝 Sosyal ve Networking</h3>
                      </div>

                      {/* Languages */}
                      <div className="space-y-4">
                        <Label className="text-lg font-medium">🌍 Konuştuğu Diller</Label>
                        
                        {/* Dropdown */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-white/5 border-white/20 hover:bg-white/10"
                            >
                              <span className="text-muted-foreground">
                                {formData.languages.length > 0 
                                  ? `${formData.languages.length} dil seçildi` 
                                  : "Dil seçin..."}
                              </span>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-white/95 backdrop-blur-sm border-white/20">
                            <Command>
                              <CommandInput placeholder="Dil ara..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>Dil bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                  {languageOptions.map((language) => (
                                    <CommandItem
                                      key={language}
                                      onSelect={() => {
                                        if (language === '✨ Diğer') {
                                          setShowCustomLanguage(!showCustomLanguage);
                                        } else {
                                          const isSelected = formData.languages.includes(language);
                                          handleArrayChange('languages', language, isSelected ? 'remove' : 'add');
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <Checkbox
                                        checked={language === '✨ Diğer' ? showCustomLanguage : formData.languages.includes(language)}
                                        className="mr-2"
                                      />
                                      {language}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Custom Language Input */}
                        {showCustomLanguage && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            <Label className="text-sm text-muted-foreground">
                              ✨ Özel diller (virgülle ayırarak birden fazla girebilirsiniz)
                            </Label>
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Örn: Arapça, İtalyanca, Japonca..."
                                value={customLanguageInput}
                                onChange={(e) => setCustomLanguageInput(e.target.value)}
                                className="flex-1 bg-white/5 border-white/20 focus:border-orange-400"
                                rows={2}
                              />
                              <Button
                                type="button"
                                onClick={() => handleCustomInput('language', customLanguageInput)}
                                className="px-4"
                              >
                                Ekle
                              </Button>
                            </div>
                          </motion.div>
                        )}

                        {/* Selected Languages as Bubbles */}
                        {(formData.languages.length > 0 || formData.customLanguages.length > 0) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {formData.languages.map((language) => (
                              <motion.div
                                key={language}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-400/30"
                              >
                                <span>{language}</span>
                                <button
                                  type="button"
                                  onClick={() => handleArrayChange('languages', language, 'remove')}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                            {formData.customLanguages.map((language) => (
                              <motion.div
                                key={language}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 px-3 py-1 bg-orange-600/30 text-orange-200 rounded-full text-sm border border-orange-500/40"
                              >
                                <span>✨ {language}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      customLanguages: prev.customLanguages.filter(l => l !== language)
                                    }));
                                  }}
                                  className="ml-1 hover:text-red-400 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      {/* Mentor Checkbox */}
                      <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <Checkbox
                          id="isMentor"
                          checked={formData.isMentor}
                          onCheckedChange={(checked) => handleInputChange('isMentor', checked)}
                        />
                        <Label htmlFor="isMentor" className="text-lg cursor-pointer">
                          🎓 Mentor olarak hizmet veriyor
                        </Label>
                      </div>

                      <Separator className="my-6" />

                      {/* Volunteer Work */}
                      <div className="space-y-2">
                        <Label htmlFor="volunteerWork">🤝 Gönüllü İşler / Topluluk Deneyimleri</Label>
                        <Textarea
                          id="volunteerWork"
                          placeholder="Gönüllü çalışmaları ve topluluk deneyimleri..."
                          value={formData.volunteerWork}
                          onChange={(e) => handleInputChange('volunteerWork', e.target.value)}
                          rows={3}
                          className="bg-white/5 border-white/20 focus:border-orange-400"
                        />
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 5: Experience */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Award className="h-5 w-5 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-semibold">🏆 Kritik Yaşam Deneyimleri</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="turningPoints">🔄 Hayatındaki Dönüm Noktaları</Label>
                          <Textarea
                            id="turningPoints"
                            placeholder="Şirket kurma, iş değiştirme, ülke değiştirme gibi dönüm noktaları..."
                            value={formData.turningPoints}
                            onChange={(e) => handleInputChange('turningPoints', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-yellow-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="challenges">💪 Karşılaştığı Büyük Zorluklar</Label>
                          <Textarea
                            id="challenges"
                            placeholder="Karşılaştığı zorluklar ve nasıl aştığı..."
                            value={formData.challenges}
                            onChange={(e) => handleInputChange('challenges', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-yellow-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lessons">📚 Öğrendiği En Büyük Dersler</Label>
                          <Textarea
                            id="lessons"
                            placeholder="Hayattan öğrendiği en önemli dersler..."
                            value={formData.lessons}
                            onChange={(e) => handleInputChange('lessons', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-yellow-400"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Step 6: Future Plans */}
                {currentStep === 5 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <Card className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-200/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <Rocket className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold">🚀 İleriye Dönük Planlar</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="futureGoals">🎯 5-10 Yıllık Hedefleri</Label>
                          <Textarea
                            id="futureGoals"
                            placeholder="Gelecek planları ve hedefleri..."
                            value={formData.futureGoals}
                            onChange={(e) => handleInputChange('futureGoals', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-indigo-400"
                          />
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
                          <Checkbox
                            id="investmentInterest"
                            checked={formData.investmentInterest}
                            onCheckedChange={(checked) => handleInputChange('investmentInterest', checked)}
                          />
                          <Label htmlFor="investmentInterest" className="text-lg cursor-pointer">
                            💰 Yatırım yapma / ortaklık kurma isteği var
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="collaborationAreas">🤝 İş Birliği Yapmak İstediği Alanlar</Label>
                          <Textarea
                            id="collaborationAreas"
                            placeholder="Hangi alanlarda iş birliği yapmak istediği..."
                            value={formData.collaborationAreas}
                            onChange={(e) => handleInputChange('collaborationAreas', e.target.value)}
                            rows={3}
                            className="bg-white/5 border-white/20 focus:border-indigo-400"
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Preview Card */}
            {formData.name && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/20">
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={formData.name}
                      fallback={formData.name}
                      size="lg"
                      className="ring-2 ring-blue-400/50"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{formData.name}</div>
                      {formData.role && (
                        <div className="text-sm text-muted-foreground">{formData.role}</div>
                      )}
                      {formData.company && (
                        <div className="text-sm text-muted-foreground">{formData.company}</div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
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
              </motion.div>
            )}


            
            {/* Debug Info */}
            <div className="text-xs text-muted-foreground p-2 bg-white/5 rounded">
              Debug: Current Step: {currentStep}, Total Steps: {steps.length}, Progress: {Math.round(progress)}%
            </div>
          </div>
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
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
