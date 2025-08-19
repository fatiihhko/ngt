import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Users, Target, MessageCircle, Sparkles, Send, Zap, DollarSign, Crown, MapPin, Scale, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useContacts } from "./ContactsContext";
import type { Contact } from "./types";
import { 
  generateTeamRecommendations,
  type TeamRequirement,
  type TeamRecommendation,
  type TeamStrategy
} from "@/utils/ragSystem";
import { createGeminiService } from "@/services/GeminiService";
import { createHybridRetrievalService } from "@/services/HybridRetrievalService";
import type { RetrievalScore } from "@/types/hybridRetrieval";
import { ContactCard } from "./ContactCard";

export const AIAssistant = () => {
  const { contacts } = useContacts();
  const [userMessage, setUserMessage] = useState("");
  const [chatState, setChatState] = useState<"waiting" | "asking" | "thinking" | "results">("waiting");
  const [teamRequirements, setTeamRequirements] = useState<TeamRequirement | null>(null);
  const [teamRecommendations, setTeamRecommendations] = useState<TeamRecommendation[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<TeamStrategy>("balanced");
  const [aiReasoning, setAiReasoning] = useState<string>("");
  const [hybridResults, setHybridResults] = useState<RetrievalScore[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const aiService = createGeminiService();
  const hybridService = createHybridRetrievalService();

  const handleStartChat = () => {
    setChatState("asking");
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    setChatState("thinking");
    
    try {
      // Use AI service to analyze project
      const aiAnalysis = await aiService.analyzeProject(userMessage, contacts);
      
      setTeamRequirements(aiAnalysis.requirements);
      setAiReasoning(aiAnalysis.reasoning);
      
      // Use hybrid retrieval system
      const hybridResult = await hybridService.search(
        userMessage,
        aiAnalysis.requirements,
        contacts
      );
      
      setHybridResults(hybridResult.recommendations);
      
      // Convert hybrid results to team recommendations format
      const scoredCandidates = hybridResult.recommendations.map(result => ({
        contact: contacts.find(c => c.id === result.personId)!,
        roleMatch: result.evidence.matchedRoles.length,
        skillMatch: result.evidence.matchedSkills.length,
        expertiseMatch: result.evidence.matchedExpertise?.length || 0,
        servicesMatch: result.evidence.matchedServices?.length || 0,
        sectorsMatch: 0, // This will be calculated by the new RAG system
        relationshipScore: result.evidence.relationshipDegree,
        availabilityScore: result.evidence.availabilityScore * 10,
        locationScore: result.evidence.locationScore * 10,
        totalScore: result.totalScore,
        matchedRoles: result.evidence.matchedRoles,
        matchedSkills: result.evidence.matchedSkills,
        matchedExpertise: result.evidence.matchedExpertise || [],
        matchedServices: result.evidence.matchedServices || [],
        matchedSectors: [] // This will be populated by the new RAG system
      }));
      
      // Generate team recommendations
      const recommendations = generateTeamRecommendations(scoredCandidates, aiAnalysis.requirements);
      setTeamRecommendations(recommendations);
      
      setChatState("results");
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setChatState("asking");
    }
  };

  const resetChat = () => {
    setUserMessage("");
    setChatState("waiting");
    setTeamRequirements(null);
    setTeamRecommendations([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-6 w-6 text-white" />
          <h2 className="text-2xl font-bold text-white">Mehmet</h2>
        </div>
        <p className="text-muted-foreground">Merhaba! Ben Mehmet, senin AI ekip kurma asistanın 👋</p>
      </div>

      {/* Chat Interface */}
      <Card className="modern-card p-6">
        {chatState === "waiting" && (
          <div className="text-center space-y-4">
            <div className="text-lg">
              Merhaba! Sana mükemmel bir ekip kurmanda yardım edebilirim. 🚀
            </div>
            <div className="text-muted-foreground">
              Başlamak için aşağıdaki butona tıkla ve bana nasıl bir ekibe ihtiyacın olduğunu anlat!
            </div>
            <Button onClick={handleStartChat} className="mt-4">
              <MessageCircle className="h-4 w-4 mr-2" />
              Ekip Kurma Sohbetini Başlat
            </Button>
          </div>
        )}

        {chatState === "asking" && (
          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                  <div className="font-medium text-primary mb-2">Mehmet</div>
                  <div>
                    Süper! Şimdi bana projeni anlat: <br/><br/>
                    🎯 <strong>Ne tür bir proje yapmak istiyorsun?</strong> (Web sitesi, mobil uygulama, pazarlama kampanyası vs.)<br/>
                    👥 <strong>Kaç kişilik bir ekip istiyorsun?</strong> (Örn: 3 kişilik ekip)<br/>
                    💡 <strong>Projenin detaylarını paylaş</strong> (Ne yapacaksınız, hangi özellikler olacak?)<br/><br/>
                    
                    Ben otomatik olarak gerekli rolleri ve becerileri çıkaracağım! 😊
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Örnek: 3 kişilik ekip istiyorum. E-ticaret web sitesi yapacağız. Online satış, ödeme sistemi ve müşteri yönetimi olacak. Hızlı başlamak istiyoruz..."
                className="min-h-24"
              />
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} disabled={!userMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Ekip Kur
                </Button>
                <Button variant="outline" onClick={resetChat}>
                  İptal Et
                </Button>
              </div>
            </div>
          </div>
        )}

        {chatState === "thinking" && (
          <div className="text-center space-y-4 py-8">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="text-lg">Gemini AI projenizi analiz ediyor...</div>
            <div className="text-muted-foreground space-y-2">
              <div>🔍 Proje gereksinimlerini çıkarıyorum</div>
              <div>👥 Gerekli rolleri belirliyorum</div>
              <div>🧠 Gemini embedding'ler oluşturuyorum</div>
              <div>🎯 Hybrid retrieval ile en uygun ekibi seçiyorum</div>
              <div>📊 4 farklı strateji önerisi hazırlıyorum</div>
            </div>
          </div>
        )}

        {chatState === "results" && teamRequirements && teamRecommendations.length > 0 && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                  <div className="font-medium text-primary mb-2">Mehmet</div>
                                      <div>
                      Harika! Projeni analiz ettim ve <strong>{teamRequirements.teamSize} kişilik ekip</strong> için 4 farklı strateji önerisi hazırladım! 🎉
                      <br/><br/>
                      <strong>Proje:</strong> {teamRequirements.description}
                      <br/><strong>Çıkarılan Roller:</strong> {teamRequirements.extractedRoles.join(", ")}
                      {teamRequirements.extractedSkills.length > 0 && (
                        <>
                          <br/><strong>Çıkarılan Beceriler:</strong> {teamRequirements.extractedSkills.join(", ")}
                        </>
                      )}
                      <br/><strong>Lokasyon:</strong> {teamRequirements.location === "local" ? "Yerel" : teamRequirements.location === "remote" ? "Uzaktan" : "Hibrit"}
                      {aiReasoning && (
                        <>
                          <br/><br/><strong>AI Analizi:</strong> {aiReasoning}
                        </>
                      )}
                      {hybridResults.length > 0 && (
                        <>
                          <br/><br/><strong>Hybrid Retrieval:</strong> {hybridResults.length} kişi bulundu 
                          (Semantic: {hybridResults[0]?.subScores.semantic.toFixed(2)}, 
                          Keyword: {hybridResults[0]?.subScores.keyword.toFixed(2)}, 
                          Proximity: {hybridResults[0]?.subScores.proximity.toFixed(2)})
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>

            {/* Strategy Tabs */}
            <Tabs value={selectedStrategy} onValueChange={(value) => setSelectedStrategy(value as TeamStrategy)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="fast_start" className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Hızlı Başlangıç
                </TabsTrigger>
                <TabsTrigger value="senior_leadership" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Senior
                </TabsTrigger>
                <TabsTrigger value="local_alignment" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Yerel
                </TabsTrigger>
                <TabsTrigger value="balanced" className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  Dengeli
                </TabsTrigger>
              </TabsList>

              {teamRecommendations.map((recommendation) => (
                <TabsContent key={recommendation.strategy} value={recommendation.strategy} className="space-y-4">
                  {/* Strategy Info */}
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      {recommendation.strategy === "fast_start" && <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {recommendation.strategy === "budget_friendly" && <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />}
                      {recommendation.strategy === "senior_leadership" && <Crown className="h-5 w-5 text-purple-600 mt-0.5" />}
                      {recommendation.strategy === "local_alignment" && <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />}
                      {recommendation.strategy === "balanced" && <Scale className="h-5 w-5 text-indigo-600 mt-0.5" />}
                      <div>
                        <div className="font-medium mb-2">{recommendation.reasoning}</div>
                                                 <div className="flex gap-4 text-sm">
                           <div className="flex items-center gap-1">
                             <DollarSign className="h-3 w-3" />
                             <span>Tahmini Maliyet: {recommendation.estimatedCost}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock className="h-3 w-3" />
                             <span>Süre: {recommendation.timeline}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             {recommendation.riskLevel === "low" && <CheckCircle className="h-3 w-3 text-green-600" />}
                             {recommendation.riskLevel === "medium" && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
                             {recommendation.riskLevel === "high" && <AlertTriangle className="h-3 w-3 text-red-600" />}
                             <span>Risk: {recommendation.riskLevel === "low" ? "Düşük" : recommendation.riskLevel === "medium" ? "Orta" : "Yüksek"}</span>
                           </div>
                         </div>
                         
                         {/* Team Composition Metrics */}
                         <div className="mt-3 p-3 bg-background/50 rounded-lg">
                           <div className="text-xs font-medium text-muted-foreground mb-2">Ekip Analizi</div>
                           <div className="grid grid-cols-2 gap-3 text-xs">
                             <div>
                               <span className="text-muted-foreground">Ortalama İlişki:</span>
                               <span className="ml-1 font-medium">{recommendation.teamComposition.averageRelationshipScore}/10</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Ortalama Müsaitlik:</span>
                               <span className="ml-1 font-medium">{recommendation.teamComposition.averageAvailabilityScore}/10</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Çeşitlilik:</span>
                               <span className="ml-1 font-medium">{recommendation.teamComposition.diversityScore}/10</span>
                             </div>
                             <div>
                               <span className="text-muted-foreground">Kapsama:</span>
                               <span className="ml-1 font-medium">{recommendation.teamComposition.coverageScore}/10</span>
                             </div>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Ekip Üyeleri ({recommendation.members.length})</h3>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {recommendation.members.map((candidate, index) => (
                        <Card 
                          key={candidate.contact.id} 
                          className="p-4 cursor-pointer hover:bg-secondary/20 transition-all duration-200 hover:scale-[1.02] group"
                          onClick={() => setSelectedContact(candidate.contact)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="font-bold text-lg group-hover:text-primary transition-colors">
                                {candidate.contact.first_name} {candidate.contact.last_name}
                              </div>
                              {candidate.contact.profession && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {candidate.contact.profession}
                                </div>
                              )}
                              {candidate.contact.company && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  🏢 {candidate.contact.company}
                                </div>
                              )}
                              {(candidate.contact.current_city || candidate.contact.city) && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  📍 {candidate.contact.current_city || candidate.contact.city}
                                </div>
                              )}
                              {candidate.contact.age && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  👤 {candidate.contact.age} yaşında
                                </div>
                              )}
                              
                              {/* Education Info */}
                              {candidate.contact.education_degree && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  🎓 {candidate.contact.education_degree}
                                  {candidate.contact.education_department && ` - ${candidate.contact.education_department}`}
                                </div>
                              )}
                              
                              {/* Languages */}
                              {candidate.contact.languages && candidate.contact.languages.length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  🌍 {candidate.contact.languages.join(", ")}
                                </div>
                              )}
                              
                              {/* Personal Traits */}
                              {candidate.contact.personal_traits && candidate.contact.personal_traits.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Kişisel Özellikler:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.contact.personal_traits.slice(0, 3).map((trait, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Matched Roles & Skills */}
                              {candidate.matchedRoles.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Uyumlu Roller:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.matchedRoles.slice(0, 2).map((role, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {candidate.matchedSkills.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Uyumlu Beceriler:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.matchedSkills.slice(0, 3).map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Expertise Matches (Uzmanlık) */}
                              {candidate.matchedExpertise && candidate.matchedExpertise.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Uyumlu Uzmanlıklar:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.matchedExpertise.slice(0, 2).map((expertise, i) => (
                                      <Badge key={i} variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                                        {expertise}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Services Matches (Hizmetler) */}
                              {candidate.matchedServices && candidate.matchedServices.length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-1">Uyumlu Hizmetler:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.matchedServices.slice(0, 2).map((service, i) => (
                                      <Badge key={i} variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Scores */}
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  {candidate.totalScore.toFixed(1)}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                İlişki: {candidate.relationshipScore}/10
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Müsaitlik: {candidate.availabilityScore}/10
                              </div>
                              <div className="text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Detayları görüntüle →
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={resetChat} variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Yeni Ekip Kur
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Contact Card Popup */}
      {selectedContact && (
        <ContactCard 
          contact={selectedContact} 
          onClose={() => setSelectedContact(null)}
          index={0}
          degreeLevel={selectedContact.relationship_degree || 5}
          showOnlyPopup={true}
        />
      )}
    </div>
  );
};