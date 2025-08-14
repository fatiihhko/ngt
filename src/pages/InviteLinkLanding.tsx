import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, AlertCircle } from "lucide-react";
import { ContactForm } from "@/components/network/ContactForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface InviteLinkInfo {
  id: string;
  name: string;
  limit_count: number;
  used_count: number;
  status: string;
}

export const InviteLinkLanding = () => {
  const { token } = useParams<{ token: string }>();
  const [linkInfo, setLinkInfo] = useState<InviteLinkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'welcome' | 'self-add' | 'add-others'>('self-add');
  const [selfContact, setSelfContact] = useState<any>(null);

  const fetchLinkInfo = async () => {
    if (!token) {
      setError("Geçersiz davet bağlantısı");
      setLoading(false);
      return;
    }

    try {
      // Use invite-lookup function to check token validity
      const { data, error } = await supabase.functions.invoke("invite-lookup", {
        body: { token }
      });

      if (error || !data || !data.valid) {
        setError("Davet bağlantısı bulunamadı veya devre dışı");
        setLoading(false);
        return;
      }

      // Get invite details from invites table
      const { data: inviteData, error: inviteError } = await supabase
        .from("invites")
        .select(`
          id,
          token,
          max_uses,
          uses_count,
          status,
          invite_chains!inner(max_uses, remaining_uses, status)
        `)
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        setError("Davet bağlantısı bulunamadı veya devre dışı");
        setLoading(false);
        return;
      }

      const chain = inviteData.invite_chains;
      const maxUses = chain.max_uses || 0;
      const remainingUses = chain.remaining_uses || 0;
      const usedCount = maxUses > 0 ? maxUses - remainingUses : 0;
      
      const linkInfo = {
        id: inviteData.id,
        name: "Davet Bağlantısı",
        limit_count: maxUses,
        used_count: usedCount,
        status: chain.status
      };

      setLinkInfo(linkInfo);
    } catch (err) {
      setError("Davet bağlantısı yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAdd = async (contactData: any) => {
    if (!token || !linkInfo) return;

    setSubmitting(true);
    try {
      // Check if person exists in system by email
      const { data: existingContact, error: checkError } = await supabase
        .from("contacts")
        .select("*")
        .eq("email", contactData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        toast({
          title: "Hata",
          description: "Sistem kontrolü sırasında hata oluştu",
          variant: "destructive",
        });
        return;
      }

      if (!existingContact) {
        toast({
          title: "Kayıtlı Değil",
          description: "Bu e-posta adresi sistemde kayıtlı değil. Lütfen doğru e-posta adresini girin.",
          variant: "destructive",
        });
        return;
      }

      // Person exists, proceed to next step
      setSelfContact(existingContact);
      setStep('add-others');
      toast({
        title: "Hoş geldiniz!",
        description: `Merhaba ${existingContact.first_name}! Şimdi tanıdıklarınızı ekleyebilirsiniz.`,
      });
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddOthers = async (contactData: any, sendEmail: boolean = false) => {
    if (!token || !linkInfo || !selfContact) return;

    setSubmitting(true);
    try {
      // Get the invite owner's user_id (this is the main center)
      const { data: inviteData, error: inviteError } = await supabase
        .from("invites")
        .select("owner_user_id")
        .eq("token", token)
        .single();

      if (inviteError || !inviteData) {
        toast({ title: "Hata", description: "Davet bilgileri bulunamadı", variant: "destructive" });
        return;
      }

      // Insert contact with selfContact as parent (connected to the person from step 1)
      const { data: inserted, error: insertError } = await supabase
        .from("contacts")
        .insert({
          user_id: inviteData.owner_user_id, // This goes to the main center's network
          first_name: contactData.first_name,
          last_name: contactData.last_name,
          city: contactData.city,
          profession: contactData.profession,
          relationship_degree: contactData.relationship_degree,
          services: contactData.services,
          tags: contactData.tags,
          phone: contactData.phone,
          email: contactData.email || null,
          description: contactData.description,
          parent_contact_id: selfContact.id, // Connected to the person from step 1
        })
        .select()
        .single();

      if (insertError) {
        toast({ title: "Kaydedilemedi", description: insertError.message, variant: "destructive" });
        return;
      }

      const data = { contact: inserted };

      if (error) {
        if (error.message?.includes("limitine ulaştı")) {
          toast({
            title: "Limit Doldu",
            description: "Bu davet bağlantısı kullanım limitine ulaştı",
            variant: "destructive",
          });
        } else if (error.message?.includes("zaten bu davet bağlantısı ile eklenmiş")) {
          toast({
            title: "Daha Önce Eklenmiş",
            description: "Bu e-posta adresi zaten bu davet bağlantısı ile eklenmiş",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: error.message || "Kişi eklenirken hata oluştu",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Başarılı!",
        description: `Kişi başarıyla eklendi. ${data.remaining_slots} slot kaldı.`,
      });

      // Refresh link info to show updated count
      fetchLinkInfo();
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLinkInfo();
  }, [token]);

  useEffect(() => {
    // Set page title and meta description
    document.title = `Davet Bağlantısı - Networking GPT`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Networking GPT ağına katılın ve tanıdıklarınızı organize edin.");
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Davet bağlantısı kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Davet Bağlantısı Geçersiz</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || "Bu davet bağlantısı artık geçerli değil."}
            </p>
            <Button asChild>
              <Link to="/">Ana Sayfaya Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUnlimited = linkInfo.limit_count === 0;
  const remainingSlots = isUnlimited ? null : linkInfo.limit_count - linkInfo.used_count;
  const isLimitReached = !isUnlimited && remainingSlots <= 0;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/networking-gpt-logo.png" 
              alt="Networking GPT Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-muted-foreground">
            Ağına kişi eklemek için davet bağlantısı
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{linkInfo.name}</span>
              <div className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded">
                Davet Bağlantısı
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLimitReached ? (
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">Limit Doldu</h3>
                  <p className="text-muted-foreground">
                    Bu davet bağlantısı kullanım limitine ulaştı.
                  </p>
                </div>
                <Button asChild>
                  <Link to="/">Ana Sayfaya Dön</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {step === 'welcome' && (
                  <div className="text-center space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Networking GPT'e Hoş Geldiniz!</h3>
                      <p className="text-muted-foreground mb-4">
                        Ağınızı oluşturmaya başlamak için önce kendinizi sisteme ekleyin.
                      </p>
                    </div>
                    <Button 
                      onClick={() => setStep('self-add')}
                      className="w-full"
                      size="lg"
                    >
                      Kendimi Ekle
                    </Button>
                  </div>
                )}

                {step === 'self-add' && (
                  <div className="space-y-4">
                    <ContactForm 
                      inviteToken={token}
                      onSuccess={(contact, values) => handleSelfAdd(values)}
                      isSelfAdd={true}
                    />
                  </div>
                )}

                                {step === 'add-others' && (
                  <div className="space-y-4">
                    <ContactForm 
                      inviteToken={token}
                      onSuccess={(contact, values, sendEmail) => handleAddOthers(values, sendEmail)}
                      isSelfAdd={false}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteLinkLanding;