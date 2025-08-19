import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { AddPersonModal } from "@/components/network/AddPersonModal";
import { ContactList } from "@/components/network/ContactList";
import { NetworkFlow } from "@/components/network/NetworkFlow";

import { ContactsProvider } from "@/components/network/ContactsContext";
import { AIAssistant } from "@/components/network/AIAssistant";
import { UserPlus, List as ListIcon, Share2, Bot, LogOut, Sparkles, Map } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useNetworkStore } from "@/store/network";


const InviteButtonInline = () => {
  const [open, setOpen] = useState(false);
  const [maxUses, setMaxUses] = useState<number>(0);
  const [link, setLink] = useState<string>("");

  const createInvite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Giriş gerekli", description: "Önce giriş yapmalısınız.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.functions.invoke("invite-create", {
      body: {
        max_uses: Number.isFinite(maxUses) ? maxUses : 0,
      },
    });

    if (error) {
      toast({ title: "Davet oluşturulamadı", description: error.message || "Bilinmeyen hata", variant: "destructive" });
      return;
    }

    const token = (data as any)?.token as string;
    const url = `${window.location.origin}/invite/${token}`;
    setLink(url);
    await navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Davet oluşturuldu", description: "Bağlantı panoya kopyalandı." });
    window.dispatchEvent(new CustomEvent("invites:refresh"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-modern hover-lift hover-glow">
          <Sparkles className="h-4 w-4 mr-2" />
          Davet Bağlantısı Oluştur
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-dark">
        <DialogHeader>
          <DialogTitle className="gradient-text">Davetiye Bağlantısı Oluştur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={createInvite} className="btn-modern hover-lift w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Bağlantı Oluştur
            </Button>
            {link && (
              <div className="flex gap-2">
                <Input readOnly value={link} className="flex-1 hover-scale text-xs" />
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(link)} className="hover-lift">
                  Kopyala
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InviteButtonMobile = () => {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string>("");

  const createInvite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Giriş gerekli", description: "Önce giriş yapmalısınız.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.functions.invoke("invite-create", {
      body: {
        max_uses: 0,
      },
    });

    if (error) {
      toast({ title: "Davet oluşturulamadı", description: error.message || "Bilinmeyen hata", variant: "destructive" });
      return;
    }

    const token = (data as any)?.token as string;
    const url = `${window.location.origin}/invite/${token}`;
    setLink(url);
    await navigator.clipboard.writeText(url).catch(() => {});
    toast({ title: "Davet oluşturuldu", description: "Bağlantı panoya kopyalandı." });
    window.dispatchEvent(new CustomEvent("invites:refresh"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="hover-lift hover-glow w-10 h-10 p-0">
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-dark max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="gradient-text text-center">Davet Bağlantısı</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button onClick={createInvite} className="btn-modern hover-lift w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Bağlantı Oluştur
          </Button>
          {link && (
            <div className="space-y-2">
              <Input readOnly value={link} className="hover-scale text-xs" />
              <Button 
                variant="secondary" 
                onClick={() => navigator.clipboard.writeText(link)} 
                className="hover-lift w-full"
              >
                Panoya Kopyala
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Network() {
  const [activeTab, setActiveTab] = useState("add");
  const { loadNetwork } = useNetworkStore();

  useEffect(() => {
    // Load network data on component mount
    loadNetwork();
  }, [loadNetwork]);

  const handleAddPersonSuccess = (person: any) => {
    toast({
      title: "Başarılı",
      description: `${person.name} başarıyla eklendi.`
    });
    // Refresh the contact list
    window.dispatchEvent(new CustomEvent("contacts:refresh"));
  };

  return (
    <ContactsProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-40 glass border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img 
                    src="/networking-gpt-logo.png" 
                    alt="Networking GPT" 
                    className="h-12 w-auto object-contain"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <InviteButtonInline />
                <Button
                  variant="outline"
                  onClick={() => supabase.auth.signOut()}
                  className="btn-modern hover-lift"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Desktop menu cards */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Add Person */}
            <div 
              onClick={() => setActiveTab("add")}
              className={`menu-card cursor-pointer ${activeTab === "add" ? "menu-card-active" : ""}`}
              style={{backgroundImage: 'url(/lovable-uploads/kisiekle.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat'}}
            >
              <div className="menu-card-content">
                <div className="menu-card-header">
                  {activeTab === "add" && <div className="menu-card-indicator" />}
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title text-white">Kişi Ekle</h3>
                  <p className="menu-card-description text-white">Yeni bağlantılar kurun</p>
                </div>
              </div>
            </div>

            {/* Network List */}
            <div 
              onClick={() => setActiveTab("list")}
              className={`menu-card ${activeTab === "list" ? "menu-card-active" : ""}`}
              style={{backgroundImage: 'url(/lovable-uploads/aglistesi.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat'}}
            >
              <div className="menu-card-content">
                <div className="menu-card-header">
                  {activeTab === "list" && <div className="menu-card-indicator" />}
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title text-white">Ağ Listesi</h3>
                  <p className="menu-card-description text-white">Tüm bağlantılarınızı görün</p>
                </div>
              </div>
            </div>

            {/* Network Map */}
            <div 
              onClick={() => setActiveTab("map")}
              className={`menu-card ${activeTab === "map" ? "menu-card-active" : ""}`}
              style={{backgroundImage: 'url(/lovable-uploads/agharitası.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat'}}
            >
              <div className="menu-card-content">
                <div className="menu-card-header">
                  {activeTab === "map" && <div className="menu-card-indicator" />}
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title">Ağ Haritası</h3>
                  <p className="menu-card-description">Görsel ağ keşfi</p>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div 
              onClick={() => setActiveTab("ai")}
              className={`menu-card ${activeTab === "ai" ? "menu-card-active" : ""}`}
              style={{backgroundImage: 'url(/lovable-uploads/aiasistan.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat'}}
            >
              <div className="menu-card-content">
                <div className="menu-card-header">
                  {activeTab === "ai" && <div className="menu-card-indicator" />}
                </div>
                <div className="menu-card-body">
                  <h3 className="menu-card-title text-white">AI Asistan</h3>
                  <p className="menu-card-description text-white">Akıllı ağ analizi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content area for desktop */}
          <Card className="modern-card marble-texture p-6 hover-lift">
            <ErrorBoundary>
              {activeTab === "add" && <AddPersonModal variant="default" onSuccess={handleAddPersonSuccess} />}
              {activeTab === "list" && <ContactList />}
              {activeTab === "map" && <NetworkFlow />}
              {activeTab === "ai" && <AIAssistant />}
            </ErrorBoundary>
          </Card>

          {/* Mobile tabs (existing functionality) */}
          <div className="md:hidden">
            <Card className="modern-card p-4 hover-lift">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <ErrorBoundary>
                  <TabsContent value="add">
                    <AddPersonModal variant="default" onSuccess={handleAddPersonSuccess} />
                  </TabsContent>
                  <TabsContent value="list">
                    <ContactList />
                  </TabsContent>
                  <TabsContent value="map">
                    <NetworkFlow />
                  </TabsContent>
                  <TabsContent value="ai">
                    <AIAssistant />
                  </TabsContent>
                </ErrorBoundary>
              </Tabs>
            </Card>
          </div>

          {/* Alt mobil gezinme çubuğu */}
          <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 glass border-t">
            <div className="grid grid-cols-4">
              <button
                type="button"
                onClick={() => setActiveTab("add")}
                aria-label="Kişi Ekle"
                aria-current={activeTab === "add"}
                className="flex flex-col items-center justify-center py-2 text-white hover:bg-white/10 transition-colors"
              >
                <UserPlus className="h-5 w-5 mb-1" />
                <span className="text-xs">Kişi Ekle</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                aria-label="Ağ Listesi"
                aria-current={activeTab === "list"}
                className="flex flex-col items-center justify-center py-2 text-white hover:bg-white/10 transition-colors"
              >
                <ListIcon className="h-5 w-5 mb-1" />
                <span className="text-xs">Liste</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                aria-label="Ağ Haritası"
                aria-current={activeTab === "map"}
                className="flex flex-col items-center justify-center py-2 text-white hover:bg-white/10 transition-colors"
              >
                <Map className="h-5 w-5 mb-1" />
                <span className="text-xs">Harita</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                aria-label="AI Asistan"
                aria-current={activeTab === "ai"}
                className="flex flex-col items-center justify-center py-2 text-white hover:bg-white/10 transition-colors"
              >
                <Bot className="h-5 w-5 mb-1" />
                <span className="text-xs">AI</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </ContactsProvider>
  );
}
