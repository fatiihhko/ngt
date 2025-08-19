import React, { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Trash2, 
  Tag,
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
  Crown,
  Zap,
  Eye,
  Flag,
  Clock,
  CheckCircle,
  User,
  Heart,
  UserPlus,
  FileText
} from "lucide-react";
import type { Contact } from "./types";
import { classifyDistanceToIstanbul } from "@/utils/distance";

const degreeColor = (degree: number) => {
  if (degree >= 8) return "hsl(var(--closeness-green))";
  if (degree >= 5) return "hsl(var(--closeness-yellow))";
  return "hsl(var(--closeness-red))";
};

interface ContactCardProps {
  contact: Contact;
  index?: number;
  degreeLevel?: number;
  onDelete?: (id: string) => void;
  onClose?: () => void;
  showOnlyPopup?: boolean;
}

export const ContactCard = memo(({ contact, index = 0, degreeLevel = 5, onDelete, onClose, showOnlyPopup = false }: ContactCardProps) => {
  const [showDetails, setShowDetails] = useState(showOnlyPopup);



  const handleClose = () => {
    setShowDetails(false);
    onClose?.();
  };

  // If showOnlyPopup is true, show only the popup
  if (showOnlyPopup) {
    return (
      <Dialog open={showDetails} onOpenChange={handleClose}>
        <DialogContent className="glass backdrop-blur-sm border-white/20 max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {contact.first_name} {contact.last_name}
                </DialogTitle>
                {contact.profession && (
                  <p className="text-muted-foreground mt-1">{contact.profession}</p>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                <User className="h-5 w-5" />
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.age && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Yaş:</span>
                    <span className="text-sm">{contact.age}</span>
                  </div>
                )}
                {contact.birth_city && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Nereli:</span>
                    <span className="text-sm">{contact.birth_city}</span>
                  </div>
                )}
                {contact.current_city && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Şu anki şehir:</span>
                    <span className="text-sm">{contact.current_city}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Telefon:</span>
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">E-posta:</span>
                    <span className="text-sm">{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            {(contact.education_school || contact.education_department || contact.education_degree) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Eğitim Bilgileri
                </h3>
                <div className="space-y-3">
                  {contact.education_school && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Okul:</span>
                      <span className="text-sm">{contact.education_school}</span>
                    </div>
                  )}
                  {contact.education_department && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Bölüm:</span>
                      <span className="text-sm">{contact.education_department}</span>
                    </div>
                  )}
                  {contact.education_degree && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Derece:</span>
                      <span className="text-sm">{contact.education_degree}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

                        {/* Professional Information */}
            {(contact.company || contact.sectors || contact.expertise || contact.services || contact.work_experience) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Briefcase className="h-5 w-5" />
                  İş ve Profesyonel Bilgiler
                </h3>
                <div className="space-y-4">
                  {contact.company && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Şirket:</span>
                      <span className="text-sm">{contact.company}</span>
                    </div>
                  )}
                  
                  {contact.sectors && contact.sectors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Çalıştığı Sektörler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.sectors.map((sector, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.expertise && contact.expertise.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Uzmanlık Alanları</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.expertise.map((exp, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.services && contact.services.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Verebileceği Hizmetler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.services.map((service, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.work_experience && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İş Deneyimi</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.work_experience}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Traits and Values */}
            {(contact.personal_traits || contact.values || contact.goals || contact.vision) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Target className="h-5 w-5" />
                  Kişisel Özellikler ve Değerler
                </h3>
                <div className="space-y-4">
                  {contact.personal_traits && contact.personal_traits.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Kişisel Özellikler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.personal_traits.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.values && contact.values.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Değer Verdiği Prensipler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.values.map((value, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.goals && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Hedefleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.goals}
                      </div>
                    </div>
                  )}
                  
                  {contact.vision && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Vizyonu</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.vision}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social and Networking */}
            {(contact.languages || contact.is_mentor || contact.volunteer_work) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Users className="h-5 w-5" />
                  Sosyal ve Networking
                </h3>
                <div className="space-y-4">

                  
                  {contact.languages && contact.languages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Konuştuğu Diller</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.languages.map((language, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {contact.is_mentor && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Mentor</span>
                    </div>
                  )}
                  
                  {contact.volunteer_work && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Gönüllü İşler / Topluluk Deneyimleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.volunteer_work}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Life Experiences */}
            {(contact.turning_points || contact.challenges || contact.lessons) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Award className="h-5 w-5" />
                  Yaşam Deneyimleri
                </h3>
                <div className="space-y-4">
                  {contact.turning_points && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Dönüm Noktaları</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.turning_points}
                      </div>
                    </div>
                  )}
                  {contact.challenges && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Karşılaştığı Zorluklar</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.challenges}
                      </div>
                    </div>
                  )}
                  {contact.lessons && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Öğrendiği Dersler</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.lessons}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Future Plans */}
            {(contact.future_goals || contact.business_ideas || contact.investment_interest || contact.collaboration_areas) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  Gelecek Planları
                </h3>
                <div className="space-y-4">
                  {contact.future_goals && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Gelecek Hedefleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.future_goals}
                      </div>
                    </div>
                  )}
                  {contact.business_ideas && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İş Fikirleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.business_ideas}
                      </div>
                    </div>
                  )}
                  {contact.investment_interest && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Yatırım yapma / ortaklık kurma isteği var</span>
                    </div>
                  )}
                  {contact.collaboration_areas && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İşbirliği Alanları</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.collaboration_areas}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {contact.description && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <FileText className="h-5 w-5" />
                  Genel Notlar
                </h3>
                <div className="p-3 bg-white/5 rounded-lg text-sm italic">
                  "{contact.description}"
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Eklenme: {new Date(contact.created_at || Date.now()).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'work': return <Building2 className="h-4 w-4" />;
      case 'family': return <Heart className="h-4 w-4" />;
      case 'friend': return <UserPlus className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'work': return 'İş';
      case 'family': return 'Aile';
      case 'friend': return 'Arkadaş';
      default: return 'Diğer';
    }
  };

  return (
    <>
  <Card 
        className="modern-card p-6 hover-lift bounce-in group cursor-pointer" 
    style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => setShowDetails(true)}
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1">
        <div className="text-xl font-bold text-white group-hover:scale-105 transition-transform">
          {contact.first_name} {contact.last_name}
        </div>
        {contact.profession && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span>{contact.profession}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span 
          className="flex items-center gap-1 text-white font-medium rounded-full px-2 py-1 text-xs"
          style={{ 
            backgroundColor: degreeColor(contact.relationship_degree),
            boxShadow: `0 0 10px ${degreeColor(contact.relationship_degree)}40`
          }}
        >
          <Star className="h-3.5 w-3.5" />
          <span>{contact.relationship_degree}/10</span>
        </span>
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
          {degreeLevel}. derece
        </span>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Kişiyi sil" 
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-dark">
            <AlertDialogHeader>
              <AlertDialogTitle className="gradient-text">Kişiyi sil</AlertDialogTitle>
              <AlertDialogDescription>
                {contact.first_name} {contact.last_name} ağınızdan kalıcı olarak silinecek. Bu işlem geri alınamaz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="hover-lift">Vazgeç</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete && onDelete(contact.id)} 
                className="bg-destructive text-destructive-foreground hover:opacity-90 hover-lift"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    {/* Location */}
    <div className="mb-4 p-3 glass rounded-lg">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {contact.current_city || contact.city || "-"}
            </span>
      </div>
      {(() => {
            const cityToCheck = contact.current_city || contact.city;
            const label = classifyDistanceToIstanbul(cityToCheck);
        const pretty: Record<string, string> = {
          "çok yakın": "Çok Yakın",
          "yakın": "Yakın", 
          "orta": "Orta",
          "uzak": "Uzak",
          "çok uzak": "Çok Uzak",
        };
        return label ? (
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
            {pretty[label]}
          </span>
        ) : null;
      })()}
    </div>

    {/* Services */}
    {contact.services?.length ? (
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-medium mb-2">
          <Tag className="h-4 w-4 text-primary" />
          <span>Yapabilecekleri</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {contact.services.map((service, i) => (
            <span key={i} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
              {service}
            </span>
          ))}
        </div>
      </div>
    ) : null}

    {/* Tags */}
    {contact.tags?.length ? (
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Özellikler</div>
        <div className="flex flex-wrap gap-1">
          {contact.tags.map((t, i) => (
            <span key={i} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>
    ) : null}

    {/* Contact info */}
    <div className="mb-4 p-3 glass rounded-lg">
      <div className="grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" />
          <span>{contact.phone || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span>{contact.email || "-"}</span>
        </div>
      </div>
    </div>

    {/* Description */}
    {contact.description ? (
      <div className="p-3 glass rounded-lg">
        <div className="text-sm italic text-muted-foreground">
          "{contact.description}"
        </div>
      </div>
    ) : null}

        {/* Click hint */}
        <div className="text-center mt-4">
          <span className="text-xs text-muted-foreground">Detayları görmek için tıklayın</span>
        </div>
  </Card>

      {/* Detailed View Modal */}
      <Dialog open={showDetails} onOpenChange={handleClose}>
        <DialogContent className="glass backdrop-blur-sm border-white/20 max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b border-white/10">
            <DialogTitle className="gradient-text flex items-center gap-3 text-2xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <div className="font-bold">{contact.first_name} {contact.last_name}</div>
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {contact.profession || "Pozisyon belirtilmemiş"}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                <User className="h-5 w-5" />
                Temel Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contact.age && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Yaş</div>
                      <div className="font-medium">{contact.age}</div>
                    </div>
                  </div>
                )}

                {contact.birth_city && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Nereli</div>
                      <div className="font-medium">{contact.birth_city}</div>
                    </div>
                  </div>
                )}

                {contact.current_city && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Şu anki şehir</div>
                      <div className="font-medium">{contact.current_city}</div>
                    </div>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Telefon</div>
                      <div className="font-medium">{contact.phone}</div>
                    </div>
                  </div>
                )}

                {contact.email && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">E-posta</div>
                      <div className="font-medium">{contact.email}</div>
                    </div>
                  </div>
                )}

                {contact.company && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Şirket</div>
                      <div className="font-medium">{contact.company}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category and Closeness */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                <Tag className="h-5 w-5" />
                Kategori ve Yakınlık
              </h3>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  {getCategoryIcon(contact.category)}
                  {getCategoryLabel(contact.category)}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Yakınlık:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < (contact.relationship_degree || 5) ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {contact.relationship_degree || 5}/10
                  </span>
                </div>
              </div>
            </div>

            {/* Education Information */}
            {(contact.education_school || contact.education_department || contact.education_degree) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <GraduationCap className="h-5 w-5" />
                  Eğitim Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.education_school && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Okul</div>
                        <div className="font-medium">{contact.education_school}</div>
                      </div>
                    </div>
                  )}
                  {contact.education_department && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Bölüm</div>
                        <div className="font-medium">{contact.education_department}</div>
                      </div>
                    </div>
                  )}
                  {contact.education_degree && (
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Award className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Derece</div>
                        <div className="font-medium">{contact.education_degree}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professional Information */}
            {(contact.company || contact.sectors?.length > 0 || contact.work_experience) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Briefcase className="h-5 w-5" />
                  İş Bilgileri
                </h3>
                <div className="space-y-4">
                  {contact.sectors?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Sektörler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.sectors.map((sector, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.work_experience && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İş Deneyimi</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.work_experience}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expertise and Services */}
            {(contact.expertise?.length > 0 || contact.services?.length > 0) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Target className="h-5 w-5" />
                  Uzmanlık ve Hizmetler
                </h3>
                <div className="space-y-4">
                  {contact.expertise?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Uzmanlık Alanları</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.expertise.map((expertise, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {expertise}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.services?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Verebileceği Hizmetler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.services.map((service, index) => (
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
            {(contact.personal_traits?.length > 0 || contact.values?.length > 0) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Star className="h-5 w-5" />
                  Kişisel Özellikler ve Değerler
                </h3>
                <div className="space-y-4">
                  {contact.personal_traits?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Kişisel Özellikler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.personal_traits.map((trait, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.values?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Değer Verdiği Prensipler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.values.map((value, index) => (
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
            {(contact.goals || contact.vision) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Lightbulb className="h-5 w-5" />
                  Hedefler ve Vizyon
                </h3>
                <div className="space-y-4">
                  {contact.goals && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Hedefleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.goals}
                      </div>
                    </div>
                  )}
                  {contact.vision && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Vizyonu</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.vision}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social and Networking */}
            {(contact.interests || contact.languages?.length > 0 || contact.is_mentor || contact.volunteer_work) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Users className="h-5 w-5" />
                  Sosyal ve Networking
                </h3>
                <div className="space-y-4">

                  {contact.languages?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Konuştuğu Diller</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.languages.map((language, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            <Languages className="h-3 w-3 mr-1" />
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {contact.is_mentor && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Mentor olarak hizmet veriyor</span>
                    </div>
                  )}
                  {contact.volunteer_work && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Gönüllü İşler</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.volunteer_work}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Life Experiences */}
            {(contact.turning_points || contact.challenges || contact.lessons) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <Award className="h-5 w-5" />
                  Yaşam Deneyimleri
                </h3>
                <div className="space-y-4">
                  {contact.turning_points && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Dönüm Noktaları</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.turning_points}
                      </div>
                    </div>
                  )}
                  {contact.challenges && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Karşılaştığı Zorluklar</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.challenges}
                      </div>
                    </div>
                  )}
                  {contact.lessons && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Öğrendiği Dersler</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.lessons}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Future Plans */}
            {(contact.future_goals || contact.business_ideas || contact.investment_interest || contact.collaboration_areas) && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  Gelecek Planları
                </h3>
                <div className="space-y-4">
                  {contact.future_goals && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Gelecek Hedefleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.future_goals}
                      </div>
                    </div>
                  )}
                  {contact.business_ideas && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İş Fikirleri</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.business_ideas}
                      </div>
                    </div>
                  )}
                  {contact.investment_interest && (
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Yatırım yapma / ortaklık kurma isteği var</span>
                    </div>
                  )}
                  {contact.collaboration_areas && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İşbirliği Alanları</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.collaboration_areas}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {contact.description && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                  <FileText className="h-5 w-5" />
                  Genel Notlar
                </h3>
                <div className="p-3 bg-white/5 rounded-lg text-sm italic">
                  "{contact.description}"
                </div>
              </div>
            )}

            {/* Created Date */}
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Eklenme: {new Date(contact.created_at || Date.now()).toLocaleDateString('tr-TR')}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ContactCard.displayName = "ContactCard";