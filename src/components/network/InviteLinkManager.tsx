import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Plus, Send, Users, ExternalLink, Mail } from "lucide-react";

interface InviteLink {
  id: string;
  name: string;
  token: string;
  limit_count: number;
  used_count: number;
  status: string;
  created_at: string;
}

interface InviteMember {
  id: string;
  member_email: string;
  created_at: string;
}

export const InviteLinkManager = () => {
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<InviteLink | null>(null);
  const [members, setMembers] = useState<InviteMember[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [showSendInviteDialog, setShowSendInviteDialog] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkLimit, setNewLinkLimit] = useState(4);
  const [emailToSend, setEmailToSend] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 Checking authentication status...");
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🔐 Current user:", user);
      setUser(user);
      
      if (!user) {
        console.error("🔐 No authenticated user found!");
        toast({ 
          title: "Hata", 
          description: "Lütfen önce giriş yapın", 
          variant: "destructive" 
        });
      }
    };
    
    checkAuth();
  }, []);

  const fetchInviteLinks = async () => {
    const { data, error } = await supabase
      .from("invite_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hata", description: "Davet bağlantıları yüklenirken hata oluştu", variant: "destructive" });
      return;
    }

    setInviteLinks(data || []);
  };

  const fetchMembers = async (linkId: string) => {
    const { data, error } = await supabase
      .from("invite_members")
      .select("*")
      .eq("invite_link_id", linkId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Hata", description: "Üyeler yüklenirken hata oluştu", variant: "destructive" });
      return;
    }

    setMembers(data || []);
  };

  const createInviteLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-link-create", {
        body: {
          name: newLinkName || "Davet Bağlantısı",
          limit_count: newLinkLimit,
        },
      });

      if (error) throw error;

      toast({ title: "Başarılı", description: "Davet bağlantısı oluşturuldu" });
      setShowCreateDialog(false);
      setNewLinkName("");
      setNewLinkLimit(4);
      fetchInviteLinks();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token: string) => {
    // Production domain kullan
    const baseUrl = window.location.hostname === 'networkgpt.tech' ? 'https://networkgpt.tech' : window.location.origin;
    const url = `${baseUrl}/invite-link/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Kopyalandı", description: "Davet bağlantısı panoya kopyalandı" });
  };

  const sendInfoEmail = async () => {
    if (!emailToSend) {
      toast({ title: "Hata", description: "E-posta adresi gerekli", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const infoHtml = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ağ GPT Bilgi</title>
            <style>
                body { margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; color: #333; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                .content { padding: 40px 30px; text-align: center; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s ease; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📧 Ağ GPT Bilgi</h1>
                    <p>Platform hakkında bilgi</p>
                </div>
                <div class="content">
                    <h2>Merhaba! 👋</h2>
                    <p>Ağ GPT platformu hakkında bilgi almak istediğiniz için teşekkürler. Bu platform profesyonel ağınızı genişletmeniz için tasarlanmıştır.</p>
                    <a href="${window.location.origin}" class="cta-button">Platformu Keşfet</a>
                </div>
            </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch(`https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailToSend,
          subject: '📧 Ağ GPT Platform Bilgisi',
          html: infoHtml
        })
      });

      if (!emailResponse.ok) {
        throw new Error('E-posta gönderim hatası');
      }

      const emailData = await emailResponse.json();
      if (!emailData.ok) {
        throw new Error(emailData.error || 'E-posta gönderilemedi');
      }

      toast({ title: "Başarılı", description: "Bilgi e-postası başarıyla gönderildi!" });
      setShowSendEmailDialog(false);
      setEmailToSend("");
    } catch (error: any) {
      toast({ 
        title: "Hata", 
        description: error.message || "E-posta gönderilirken hata oluştu", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const testHtml = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test E-postası</title>
            <style>
                body { margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                .content { padding: 40px 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🧪 Test E-postası</h1>
                    <p>SendGrid entegrasyonu test ediliyor</p>
                </div>
                <div class="content">
                    <h2>Test Başarılı! ✅</h2>
                    <p>SendGrid e-posta gönderim sistemi düzgün çalışıyor.</p>
                    <p><strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch(`https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: '🧪 Test E-postası - SendGrid',
          html: testHtml
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Test e-postası gönderilemedi');
      }

      const emailData = await emailResponse.json();
      if (!emailData.ok) {
        throw new Error(emailData.error || 'Test e-postası gönderilemedi');
      }

      toast({ title: "Test Başarılı!", description: `Test e-postası ${user.email} adresine gönderildi.` });
    } catch (error: any) {
      toast({ 
        title: "Test Hatası", 
        description: error.message || "Test e-postası gönderilemedi", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInviteViaEmail = async () => {
    if (!inviteEmail) {
      toast({ title: "Hata", description: "E-posta adresi gerekli", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Hata", description: "Lütfen önce giriş yapın", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: emailToSend,
          contactName: "Kullanıcı",
          inviterName: user.email || "Sistem"
        },
      });

      console.log("📧 Info email response:", { data, error });
      console.log("📧 Response data type:", typeof data);
      console.log("📧 Response error type:", typeof error);

      if (error) {
        console.error("📧 Supabase function error:", error);
        throw error;
      }

      console.log("📧 Email sent successfully!");
      toast({ title: "Başarılı", description: "Bilgilendirme e-postası başarıyla gönderildi!" });
      setShowSendEmailDialog(false);
      setEmailToSend("");
    } catch (error: any) {
      console.error("📧 Info email error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });
      toast({ 
        title: "Hata", 
        description: error.message || "Email gönderilirken hata oluştu", 
        variant: "destructive" 
      });
    } finally {
      console.log("📧 Setting loading to false");
      setLoading(false);
    }
  };

  const sendInviteEmail = async () => {
    console.log("📧 sendInviteEmail function called");
    console.log("📧 inviteEmail:", inviteEmail);
    console.log("📧 inviteMessage:", inviteMessage);
    console.log("📧 senderName:", senderName);
    console.log("📧 user:", user);
    console.log("📧 loading state:", loading);

    if (!inviteEmail) {
      console.error("📧 No invite email provided");
      toast({ title: "Hata", description: "E-posta adresi gerekli", variant: "destructive" });
      return;
    }

    if (!user) {
      console.error("📧 No authenticated user");
      toast({ title: "Hata", description: "Lütfen önce giriş yapın", variant: "destructive" });
      return;
    }

    console.log("📧 Starting invite email send to:", inviteEmail);
    setLoading(true);
    
    try {
      console.log("📧 About to call supabase.functions.invoke for send-invite-email...");
      
      const { data, error } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: inviteEmail,
          message: inviteMessage || "Network GPT'ye katılmaya davetlisiniz!",
          senderName: senderName || user.email || "Network GPT",
        },
      });

      console.log("📧 Invite email response:", { data, error });
      console.log("📧 Response data type:", typeof data);
      console.log("📧 Response error type:", typeof error);

      if (error) {
        console.error("📧 Supabase function error:", error);
        throw error;
      }

      console.log("📧 Invite email sent successfully!");
      toast({ title: "Başarılı", description: "Davet e-postası başarıyla gönderildi!" });
      setShowSendInviteDialog(false);
      setInviteEmail("");
      setInviteMessage("");
      setSenderName("");
    } catch (error: any) {
      console.error("📧 Invite email error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });
      toast({ 
        title: "Hata", 
        description: error.message || "Email gönderilirken hata oluştu", 
        variant: "destructive" 
      });
    } finally {
      console.log("📧 Setting loading to false");
      setLoading(false);
    }
  };

  const viewMembers = (link: InviteLink) => {
    setSelectedLink(link);
    fetchMembers(link.id);
    setShowMembersDialog(true);
  };

  useEffect(() => {
    fetchInviteLinks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Davet Bağlantıları</h2>
          <p className="text-muted-foreground">Limitli davet bağlantıları oluşturun ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={sendTestEmail} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Gönderiliyor..." : "Test E-postası"}
          </Button>

          <Dialog open={showSendInviteDialog} onOpenChange={setShowSendInviteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Davet Gönder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>E-posta ile Davet Gönder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail">E-posta Adresi</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="senderName">Gönderen Adı (İsteğe bağlı)</Label>
                  <Input
                    id="senderName"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <Label htmlFor="inviteMessage">Kişisel Mesaj (İsteğe bağlı)</Label>
                  <Textarea
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Davetinizle birlikte gönderilecek kişisel mesaj..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSendInviteDialog(false)}>
                    İptal
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log("📧 Invite email button clicked!");
                      console.log("📧 Current inviteEmail:", inviteEmail);
                      console.log("📧 Current loading:", loading);
                      sendInviteEmail();
                    }} 
                    disabled={loading || !inviteEmail}
                  >
                    {loading ? "Gönderiliyor..." : "Davet Gönder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Bilgi E-postası Gönder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bilgilendirme E-postası Gönder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">E-posta Adresi</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailToSend}
                    onChange={(e) => setEmailToSend(e.target.value)}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSendEmailDialog(false)}>
                    İptal
                  </Button>
                  <Button 
                    onClick={() => {
                      console.log("📧 Info email button clicked!");
                      console.log("📧 Current emailToSend:", emailToSend);
                      console.log("📧 Current loading:", loading);
                      sendInfoEmail();
                    }} 
                    disabled={loading || !emailToSend}
                  >
                    {loading ? "Gönderiliyor..." : "Gönder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Davet Bağlantısı
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Davet Bağlantısı Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Bağlantı Adı</Label>
                  <Input
                    id="name"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="Davet Bağlantısı"
                  />
                </div>
                <div>
                  <Label htmlFor="limit">Kullanım Limiti</Label>
                  <Input
                    id="limit"
                    type="number"
                    min={1}
                    value={newLinkLimit}
                    onChange={(e) => setNewLinkLimit(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    İptal
                  </Button>
                  <Button onClick={createInviteLink} disabled={loading}>
                    {loading ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {inviteLinks.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{link.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Oluşturulma: {new Date(link.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={link.status === "active" ? "default" : "secondary"}>
                    {link.status === "active" ? "Aktif" : "Pasif"}
                  </Badge>
                  <Badge variant="outline">
                    {link.used_count}/{link.limit_count}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <code className="flex-1 p-2 bg-muted rounded text-sm">
                  {window.location.origin}/invite-link/{link.token}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(link.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/invite-link/${link.token}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {link.limit_count - link.used_count} slot kaldı
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewMembers(link)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Üyeleri Görüntüle
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLink?.name} - Eklenen Üyeler
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Henüz hiç üye eklenmemiş
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <span>{member.member_email}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};