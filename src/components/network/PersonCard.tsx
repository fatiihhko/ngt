import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  Heart, 
  Tag, 
  FileText,
  Edit,
  Trash2,
  Link,
  UserPlus,
  Crown,
  Calendar,
  GraduationCap,
  Briefcase,
  Target,
  Users,
  Globe,
  BookOpen,
  Award,
  Lightbulb,
  TrendingUp,
  Languages,
  Star,
  Shield,
  Zap,
  Eye,
  Flag,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { Person } from './types';

interface PersonCardProps {
  person: Person;
  variant: 'mini' | 'full';
  onEdit?: (person: Person) => void;
  onDelete?: (personId: string) => void;
  onConnect?: (personId: string) => void;
}

export const PersonCard = ({ 
  person, 
  variant, 
  onEdit, 
  onDelete, 
  onConnect 
}: PersonCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'family': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'friend': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'work': return <Building2 className="h-3 w-3" />;
      case 'family': return <Heart className="h-3 w-3" />;
      case 'friend': return <UserPlus className="h-3 w-3" />;
      default: return <Tag className="h-3 w-3" />;
    }
  };

  const getClosenessDots = (closeness?: number) => {
    const dots = [];
    const maxDots = 5;
    const filledDots = closeness || 3;
    
    for (let i = 0; i < maxDots; i++) {
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < filledDots ? 'bg-primary' : 'bg-muted'
          }`}
        />
      );
    }
    return dots;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === 'mini') {
    return (
      <Card 
        className="p-3 max-w-xs glass border shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={person.avatarUrl} />
            <AvatarFallback className="text-xs">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{person.name}</h4>
              {person.handle && (
                <span className="text-xs text-muted-foreground">@{person.handle}</span>
              )}
            </div>
            
            {person.role && (
              <div className="flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{person.role}</span>
              </div>
            )}
            
            {person.city && (
              <div className="flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{person.city}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {getClosenessDots(person.closeness)}
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryColor(person.category)}`}
              >
                {getCategoryIcon(person.category)}
                <span className="ml-1">
                  {person.category === 'work' ? 'İş' : 
                   person.category === 'family' ? 'Aile' :
                   person.category === 'friend' ? 'Arkadaş' : 'Diğer'}
                </span>
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 glass border shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={person.avatarUrl} />
            <AvatarFallback className="text-sm">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-semibold text-lg">{person.name}</h3>
            {person.handle && (
              <p className="text-sm text-muted-foreground">@{person.handle}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(person)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(person.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Role and Category */}
      <div className="flex items-center gap-2 mb-3">
        {person.role && (
          <Badge variant="secondary" className="text-xs">
            <Building2 className="h-3 w-3 mr-1" />
            {person.role}
          </Badge>
        )}
        <Badge 
          variant="outline" 
          className={`text-xs ${getCategoryColor(person.category)}`}
        >
          {getCategoryIcon(person.category)}
          <span className="ml-1">
            {person.category === 'work' ? 'İş' : 
             person.category === 'family' ? 'Aile' :
             person.category === 'friend' ? 'Arkadaş' : 'Diğer'}
          </span>
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        {person.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{person.email}</span>
          </div>
        )}
        
        {person.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{person.phone}</span>
          </div>
        )}
        
        {person.city && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{person.city}</span>
          </div>
        )}

        {/* New Basic Information */}
        {person.age && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{person.age} yaşında</span>
          </div>
        )}

        {person.birthCity && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Nereli: {person.birthCity}</span>
          </div>
        )}

        {person.currentCity && person.currentCity !== person.city && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Şu an: {person.currentCity}</span>
          </div>
        )}
      </div>

      {/* Education Information */}
      {(person.education?.school || person.education?.department || person.education?.degree) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Eğitim
          </h4>
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            {person.education?.school && <div><strong>Okul:</strong> {person.education.school}</div>}
            {person.education?.department && <div><strong>Bölüm:</strong> {person.education.department}</div>}
            {person.education?.degree && <div><strong>Derece:</strong> {person.education.degree}</div>}
            {person.education?.graduationYear && <div><strong>Mezuniyet:</strong> {person.education.graduationYear}</div>}
          </div>
        </div>
      )}

      {/* Professional Information */}
      {(person.company || person.sectors?.length > 0 || person.workExperience) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            İş Bilgileri
          </h4>
          <div className="space-y-2">
            {person.company && (
              <div className="text-sm text-muted-foreground">
                <strong>Şirket:</strong> {person.company}
              </div>
            )}
            {person.sectors && person.sectors.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Sektörler:</div>
                <div className="flex flex-wrap gap-1">
                  {person.sectors.map((sector, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {person.workExperience && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>İş Deneyimi:</strong> {person.workExperience}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expertise and Services */}
      {(person.expertise?.length > 0 || person.services?.length > 0) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Uzmanlık ve Hizmetler
          </h4>
          <div className="space-y-2">
            {person.expertise && person.expertise.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Uzmanlık Alanları:</div>
                <div className="flex flex-wrap gap-1">
                  {person.expertise.map((exp, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {person.services && person.services.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Hizmetler:</div>
                <div className="flex flex-wrap gap-1">
                  {person.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personal Traits and Values */}
      {(person.personalTraits?.length > 0 || person.values?.length > 0) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Kişisel Özellikler ve Değerler
          </h4>
          <div className="space-y-2">
            {person.personalTraits && person.personalTraits.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Kişisel Özellikler:</div>
                <div className="flex flex-wrap gap-1">
                  {person.personalTraits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {person.values && person.values.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Değerler:</div>
                <div className="flex flex-wrap gap-1">
                  {person.values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goals and Vision */}
      {(person.goals || person.vision) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Hedefler ve Vizyon
          </h4>
          <div className="space-y-2">
            {person.goals && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Hedefler:</strong> {person.goals}
              </div>
            )}
            {person.vision && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Vizyon:</strong> {person.vision}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social and Networking */}
      {(person.languages?.length > 0 || person.isMentor || person.volunteerWork) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sosyal ve Networking
          </h4>
          <div className="space-y-2">

            {person.languages && person.languages.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-1">Diller:</div>
                <div className="flex flex-wrap gap-1">
                  {person.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Languages className="h-3 w-3 mr-1" />
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {person.isMentor && (
              <div className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">Mentor olarak hizmet veriyor</span>
              </div>
            )}
            {person.volunteerWork && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Gönüllü İşler:</strong> {person.volunteerWork}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Life Experiences */}
      {(person.turningPoints || person.challenges || person.lessons) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Yaşam Deneyimleri
          </h4>
          <div className="space-y-2">
            {person.turningPoints && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Dönüm Noktaları:</strong> {person.turningPoints}
              </div>
            )}
            {person.challenges && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Zorluklar:</strong> {person.challenges}
              </div>
            )}
            {person.lessons && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Öğrenilen Dersler:</strong> {person.lessons}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Future Plans */}
      {(person.futureGoals || person.businessIdeas || person.investmentInterest || person.collaborationAreas) && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Gelecek Planları
          </h4>
          <div className="space-y-2">
            {person.futureGoals && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>Gelecek Hedefleri:</strong> {person.futureGoals}
              </div>
            )}
            {person.businessIdeas && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>İş Fikirleri:</strong> {person.businessIdeas}
              </div>
            )}
            {person.investmentInterest && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Yatırım yapma / ortaklık kurma isteği var</span>
              </div>
            )}
            {person.collaborationAreas && (
              <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <strong>İşbirliği Alanları:</strong> {person.collaborationAreas}
              </div>
            )}
          </div>
        </div>
      )}

      <Separator className="my-3" />

      {/* Closeness */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Yakınlık</span>
          <span className="text-sm text-muted-foreground">
            {person.closeness || 3}/5
          </span>
        </div>
        <div className="flex gap-1">
          {getClosenessDots(person.closeness)}
        </div>
      </div>

      {/* Description */}
      {person.description && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Notlar</h4>
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            {person.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onConnect && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConnect(person.id)}
            className="flex-1"
          >
            <Link className="h-4 w-4 mr-2" />
            Bağlantı Ekle
          </Button>
        )}
      </div>

      {/* Created Date */}
      <div className="mt-3 text-xs text-muted-foreground">
        Eklenme: {new Date(person.createdAt).toLocaleDateString('tr-TR')}
      </div>
    </Card>
  );
};
