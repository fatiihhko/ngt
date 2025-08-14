import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

import { supabase } from "@/integrations/supabase/client";
import { ContactForm } from "@/components/network/ContactForm";
import { ContactList } from "@/components/network/ContactList";
import { NetworkFlow } from "@/components/network/NetworkFlow";

import { ContactsProvider } from "@/components/network/ContactsContext";
import { AIAssistant } from "@/components/network/AIAssistant";
import { UserPlus, List as ListIcon, Share2, Bot, LogOut, Sparkles, Map } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";



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
    const url = `${window.location.origin}/invite-link/${token}`;
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
    const url = `${window.location.origin}/invite-link/${token}`;
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


const Network = () => {
  const [activeTab, setActiveTab] = useState("add");
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Çıkış yapıldı", description: "Başarıyla çıkış yaptınız." });
  };

  return (
    <ContactsProvider>
      <main className="min-h-screen px-4 pt-6 pb-24 md:p-8 gradient-bg">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl float" style={{animationDelay: '1s'}}></div>
        </div>

        <header className="mb-6 flex items-center justify-between gap-3 relative z-10 fade-in">
          <div className="flex items-center gap-4">
            <img 
              src="/networking-gpt-logo.png" 
              alt="Networking GPT Logo" 
              className="h-8 md:h-12 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <InviteButtonInline />
            </div>
            <div className="md:hidden">
              <InviteButtonMobile />
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hover-lift hover-glow w-10 h-10 p-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        {/* Modern Menu Cards */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {/* Add Contact */}
            <div 
              onClick={() => setActiveTab("add")}
              className={`menu-card ${activeTab === "add" ? "menu-card-active" : ""}`}
              style={{backgroundImage: 'url(/lovable-uploads/57b52711-75e1-460c-86d2-ab82f0984651.png)'}}
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
              style={{backgroundImage: 'url(/lovable-uploads/84a0729d-10e4-4a40-b43e-adb34ad6ab0d.png)'}}
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
              style={{backgroundImage: 'url(/lovable-uploads/9fb618e5-56fd-49dc-a341-8c856ba65545.png)'}}
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
              style={{backgroundImage: 'url(/lovable-uploads/704fb316-91d6-4a36-9a70-acefffccb8c5.png)'}}
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
              {activeTab === "add" && <ContactForm />}
              {activeTab === "list" && <ContactList />}
              {activeTab === "map" && <NetworkFlow />}
              {activeTab === "ai" && <AIAssistant />}
            </ErrorBoundary>
          </Card>
        </div>

        {/* Mobile tabs (existing functionality) */}
        <div className="md:hidden">
          <Card className="modern-card p-4 hover-lift">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ErrorBoundary>
                <TabsContent value="add">
                  <ContactForm />
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
              className={`h-16 w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 ${
                activeTab === "add" 
                  ? "text-primary pulse-glow" 
                  : "text-muted-foreground hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <UserPlus className="h-5 w-5 text-white" />
              <span className="text-xs text-white">Kişi Ekle</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              aria-label="Ağ Listesi"
              aria-current={activeTab === "list"}
              className={`h-16 w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 ${
                activeTab === "list" 
                  ? "text-primary pulse-glow" 
                  : "text-muted-foreground hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <ListIcon className="h-5 w-5 text-white" />
              <span className="text-xs text-white">Ağ Listesi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              aria-label="Görsel Ağ Haritası"
              aria-current={activeTab === "map"}
              className={`h-16 w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 ${
                activeTab === "map" 
                  ? "text-primary pulse-glow" 
                  : "text-muted-foreground hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-xs">Harita</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              aria-label="Yapay Zeka Asistanı"
              aria-current={activeTab === "ai"}
              className={`h-16 w-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 ${
                activeTab === "ai" 
                  ? "text-primary pulse-glow" 
                  : "text-muted-foreground hover:text-foreground"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <Bot className="h-5 w-5" />
              <span className="text-xs">Asistan</span>
            </button>
          </div>
        </nav>
      </main>
    </ContactsProvider>
  );
};

export default Network;
