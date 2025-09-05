import React, { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
  FileText,
  Sparkles,
  X
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
      <motion.div
        className="h-full"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card 
          className="modern-card p-6 hover-lift group cursor-pointer bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-200/20 hover:border-blue-300/30 transition-all duration-300 h-full w-full flex flex-col" 
          onClick={() => setShowDetails(true)}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <motion.div 
                className="text-xl font-bold text-white group-hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
              >
                {contact.first_name} {contact.last_name}
              </motion.div>
              {contact.profession && (
                <motion.div 
                  className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{contact.profession}</span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.span 
                className="flex items-center gap-1 text-white font-medium rounded-full px-2 py-1 text-xs"
                style={{ 
                  backgroundColor: degreeColor(contact.relationship_degree),
                  boxShadow: `0 0 10px ${degreeColor(contact.relationship_degree)}40`
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star className="h-3.5 w-3.5" />
                <span>{contact.relationship_degree}/10</span>
              </motion.span>
              <motion.span 
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                whileHover={{ scale: 1.05 }}
              >
                {degreeLevel}. derece
              </motion.span>

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
          <motion.div 
            className="mb-4 p-3 glass rounded-lg bg-white/5 border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
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
                <motion.span 
                  className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {pretty[label]}
                </motion.span>
              ) : null;
            })()}
          </motion.div>

          {/* Quick Info - Fixed Height Container */}
          <div className="space-y-3 flex-1 min-h-0">
            {contact.company && (
              <motion.div 
                className="flex items-center gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Building2 className="h-4 w-4 text-primary" />
                <span className="truncate">{contact.company}</span>
              </motion.div>
            )}
            
            {contact.category && (
              <motion.div 
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Tag className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(contact.category)}
                </Badge>
              </motion.div>
            )}

            {/* Uzmanlık Alanları */}
            {contact.expertise && contact.expertise.length > 0 && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Uzmanlık Alanları</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {contact.expertise.map((exp, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-300/30">
                        {exp}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Verebileceği Hizmetler */}
            {contact.services && contact.services.length > 0 && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Verebileceği Hizmetler</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {contact.services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300 border-green-300/30">
                        {service}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Click hint - Flexible positioning */}
          <motion.div 
            className="text-center mt-6 pt-4 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="h-3 w-3" />
              Detayları görmek için tıklayın
            </span>
          </motion.div>
        </Card>
      </motion.div>

      {/* Enhanced Detailed View Modal */}
      <Dialog open={showDetails} onOpenChange={handleClose}>
        <DialogContent className="glass backdrop-blur-sm border-white/20 max-w-6xl max-h-[95vh] overflow-hidden p-0">
          {/* Enhanced Header with Vibrant Gradient Background */}
          <motion.div 
            className="relative p-8 pb-6 bg-gradient-to-br from-blue-500/40 via-purple-500/50 to-blue-600/40 border-b border-blue-300/30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Floating particles in header */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
                  initial={{ 
                    x: Math.random() * 400,
                    y: Math.random() * 100,
                    scale: 0
                  }}
                  animate={{
                    x: Math.random() * 400,
                    y: Math.random() * 100,
                    scale: [0, 1, 0],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/60 to-purple-500/70 flex items-center justify-center shadow-lg border border-primary/50"
                  animate={{ 
                    rotate: [0, 2, -2, 0],
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 0 rgba(59, 130, 246, 0)",
                      "0 0 30px rgba(59, 130, 246, 0.5)",
                      "0 0 0 rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                >
                  <User className="h-10 w-10 text-white" />
                </motion.div>
                
                <div className="space-y-2">
                  <motion.h2 
                    className="text-3xl font-bold text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {contact.first_name} {contact.last_name}
                  </motion.h2>
                  
                  {contact.profession && (
                    <motion.p 
                      className="text-lg text-muted-foreground flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Briefcase className="h-5 w-5 text-primary" />
                      {contact.profession}
                    </motion.p>
                  )}

                  {/* Quick Stats Row */}
                  <motion.div 
                    className="flex items-center gap-4 pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: degreeColor(contact.relationship_degree) }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      <span className="text-sm text-muted-foreground">
                        Yakınlık: {contact.relationship_degree}/10
                      </span>
                    </div>
                    
                    {contact.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(contact.category)}
                        </Badge>
                      </div>
                    )}

                    {contact.current_city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {contact.current_city}
                        </span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>


            </div>
          </motion.div>

          {/* Scrollable Content Area */}
          <div className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-200px)]">
            {/* Basic Information */}
            <motion.div 
              className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl p-6 border border-blue-300/40 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <motion.h3 
                className="text-xl font-semibold flex items-center gap-3 mb-6 text-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/60 to-blue-600/80 flex items-center justify-center border border-blue-300/50">
                  <User className="h-5 w-5 text-white" />
                </div>
                Temel Bilgiler
              </motion.h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contact.age && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Yaş</div>
                      <div className="font-medium">{contact.age}</div>
                    </div>
                  </motion.div>
                )}

                {contact.birth_city && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Nereli</div>
                      <div className="font-medium">{contact.birth_city}</div>
                    </div>
                  </motion.div>
                )}

                {contact.current_city && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Şu anki şehir</div>
                      <div className="font-medium">{contact.current_city}</div>
                    </div>
                  </motion.div>
                )}

                {contact.phone && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Telefon</div>
                      <div className="font-medium">{contact.phone}</div>
                    </div>
                  </motion.div>
                )}

                {contact.email && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">E-posta</div>
                      <div className="font-medium">{contact.email}</div>
                    </div>
                  </motion.div>
                )}

                {contact.company && (
                  <motion.div 
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Şirket</div>
                      <div className="font-medium">{contact.company}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Category and Closeness */}
            <motion.div 
              className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl p-6 border border-purple-300/40 shadow-lg backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            >
              <motion.h3 
                className="text-xl font-semibold flex items-center gap-3 mb-6 text-purple-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400/60 to-purple-600/80 flex items-center justify-center border border-purple-300/50">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                Kategori ve Yakınlık
              </motion.h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Kategori:</span>
                  <Badge variant="secondary">
                    {getCategoryLabel(contact.category)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Yakınlık:</span>
                  <motion.div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: degreeColor(contact.relationship_degree),
                      color: 'white'
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star className="h-3 w-3" />
                    {contact.relationship_degree}/10
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Education */}
            {(contact.education_school || contact.education_department || contact.education_degree) && (
              <motion.div 
                className="bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-2xl p-6 border border-green-300/40 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-green-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400/60 to-green-600/80 flex items-center justify-center border border-green-300/50">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  Eğitim Bilgileri
                </motion.h3>
                <div className="space-y-3">
                  {contact.education_school && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Okul</div>
                        <div className="font-medium">{contact.education_school}</div>
                      </div>
                    </motion.div>
                  )}
                  {contact.education_department && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <BookOpen className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Bölüm</div>
                        <div className="font-medium">{contact.education_department}</div>
                      </div>
                    </motion.div>
                  )}
                  {contact.education_degree && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Award className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Derece</div>
                        <div className="font-medium">{contact.education_degree}</div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Professional Information */}
            {(contact.company || contact.sectors || contact.expertise || contact.services || contact.work_experience) && (
              <motion.div 
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-2xl p-6 border border-blue-300/40 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-blue-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/60 to-blue-600/80 flex items-center justify-center border border-blue-300/50">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  İş ve Profesyonel Bilgiler
                </motion.h3>
                <div className="space-y-4">
                  {contact.company && (
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Şirket</div>
                        <div className="font-medium">{contact.company}</div>
                      </div>
                    </motion.div>
                  )}
                  
                  {contact.sectors && contact.sectors.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Çalıştığı Sektörler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.sectors.map((sector, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.expertise && contact.expertise.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Uzmanlık Alanları</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.expertise.map((exp, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300">
                              {exp}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.services && contact.services.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Verebileceği Hizmetler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.services.map((service, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300">
                              {service}
                            </Badge>
                          </motion.div>
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
              </motion.div>
            )}

            {/* Personal Traits and Values */}
            {(contact.personal_traits || contact.values || contact.goals || contact.vision) && (
              <motion.div 
                className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/40 flex items-center justify-center">
                    <Heart className="h-5 w-5" />
                  </div>
                  Kişisel Özellikler ve Değerler
                </motion.h3>
                <div className="space-y-4">
                  {contact.personal_traits && contact.personal_traits.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Kişisel Özellikler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.personal_traits.map((trait, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                              {trait}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.values && contact.values.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Değerler</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.values.map((value, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300">
                              {value}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.goals && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Hedefler</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.goals}
                      </div>
                    </div>
                  )}

                  {contact.vision && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Vizyon</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.vision}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Languages and Interests */}
            {(contact.languages || contact.interests) && (
              <motion.div 
                className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/40 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  Diller ve İlgi Alanları
                </motion.h3>
                <div className="space-y-4">
                  {contact.languages && contact.languages.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">Konuştuğu Diller</div>
                      <div className="flex flex-wrap gap-2">
                        {contact.languages.map((language, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="text-xs bg-orange-500/20 text-orange-300">
                              {language}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.interests && (
                    <div>
                      <div className="text-sm font-medium mb-2 text-muted-foreground">İlgi Alanları</div>
                      <div className="p-3 bg-white/5 rounded-lg text-sm">
                        {contact.interests}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Life Experiences */}
            {(contact.turning_points || contact.challenges || contact.lessons) && (
              <motion.div 
                className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  Yaşam Deneyimleri
                </motion.h3>
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
              </motion.div>
            )}

            {/* Future Plans */}
            {(contact.future_goals || contact.business_ideas || contact.investment_interest || contact.collaboration_areas) && (
              <motion.div 
                className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/40 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  Gelecek Planları
                </motion.h3>
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
                    <motion.div 
                      className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Yatırım yapma / ortaklık kurma isteği var</span>
                    </motion.div>
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
              </motion.div>
            )}

            {/* Description */}
            {contact.description && (
              <motion.div 
                className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 shadow-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              >
                <motion.h3 
                  className="text-xl font-semibold flex items-center gap-3 mb-6 text-primary"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/40 flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  Genel Notlar
                </motion.h3>
                <div className="p-3 bg-white/5 rounded-lg text-sm italic">
                  "{contact.description}"
                </div>
              </motion.div>
            )}

            {/* Created Date */}
            <motion.div 
              className="text-center pt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/5 to-white/10 rounded-full border border-white/20">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Eklenme: {new Date(contact.created_at || Date.now()).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

ContactCard.displayName = "ContactCard";

