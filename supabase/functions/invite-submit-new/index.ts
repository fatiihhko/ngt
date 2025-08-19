import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const admin = createClient(supabaseUrl!, serviceRoleKey!);

interface SubmitBody {
  token: string;
  sendEmail?: boolean;
  base_url?: string;
  contact: {
    first_name: string;
    last_name: string;
    city?: string | null;
    profession?: string | null;
    relationship_degree: number;
    services?: string[] | string | null;
    tags?: string[] | string | null;
    phone?: string | null;
    email?: string | null;
    description?: string | null;
    // New comprehensive fields
    age?: string | null;
    birth_city?: string | null;
    current_city?: string | null;
    education_school?: string | null;
    education_department?: string | null;
    education_degree?: string | null;
    education_graduation_year?: string | null;
    company?: string | null;
    sectors?: string[] | null;
    custom_sector?: string | null;
    work_experience?: string | null;
    expertise?: string[] | null;
    custom_expertise?: string | null;
    custom_service?: string | null;
    investments?: string | null;
    personal_traits?: string[] | null;
    values?: string[] | null;
    goals?: string | null;
    vision?: string | null;
    interests?: string | null;
    languages?: string[] | null;
    custom_language?: string | null;
    is_mentor?: boolean | null;
    volunteer_work?: string | null;
    turning_points?: string | null;
    challenges?: string | null;
    lessons?: string | null;
    future_goals?: string | null;
    business_ideas?: string | null;
    investment_interest?: boolean | null;
    collaboration_areas?: string | null;
    parent_contact_id?: string | null;
  };
}

// SendGrid API ile e-posta gönderme fonksiyonu
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch(`https://ysqnnassgbihnrjkcekb.supabase.co/functions/v1/send-invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Email sending failed');
  }

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error || 'Email sending failed');
  }

  return { success: true };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // More flexible Content-Type checking
    const ct = req.headers.get("content-type") || "";
    if (!ct.toLowerCase().includes("application/json")) {
      return new Response(JSON.stringify({ error: "İstek JSON olmalı (application/json)" }), {
        status: 415,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: SubmitBody = await req.json().catch(() => null as any);
    if (!body) {
      return new Response(JSON.stringify({ error: "Geçersiz JSON gövdesi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { token, contact, sendEmail: shouldSendEmailFlag, base_url } = body;
    


    // Zorunlu alanlar
    if (!token) {
      console.log('invite-submit-new Error - Missing token');
      return new Response(JSON.stringify({ error: "token gerekli" }), {
        status: 422,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!contact?.first_name || !contact?.last_name) {
      console.log('invite-submit-new Error - Missing first_name or last_name:', { first_name: contact?.first_name, last_name: contact?.last_name });
      return new Response(JSON.stringify({ error: "ad/soyad gerekli" }), {
        status: 422,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (typeof contact.relationship_degree !== "number") {
      console.log('invite-submit-new Error - Invalid relationship_degree:', { relationship_degree: contact.relationship_degree, type: typeof contact.relationship_degree });
      return new Response(JSON.stringify({ error: "relationship_degree sayısal olmalı" }), {
        status: 422,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Normalize arrays
    const toArray = (v?: string[] | string | null) =>
      Array.isArray(v)
        ? v
        : (v || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    const services = toArray(contact.services);
    const tags = toArray(contact.tags);
    const sectors = toArray(contact.sectors);
    const expertise = toArray(contact.expertise);
    const personal_traits = toArray(contact.personal_traits);
    const values = toArray(contact.values);
    const languages = toArray(contact.languages);

    // RPC çağrısı
    console.log("Calling accept_invite_and_add_contact with:", {
      p_token: token,
      p_contact: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        city: contact.city ?? null,
        profession: contact.profession ?? null,
        relationship_degree: contact.relationship_degree,
        services,
        tags,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        description: contact.description ?? null,
        // New comprehensive fields
        age: contact.age ?? null,
        birth_city: contact.birth_city ?? null,
        current_city: contact.current_city ?? null,
        education_school: contact.education_school ?? null,
        education_department: contact.education_department ?? null,
        education_degree: contact.education_degree ?? null,
        education_graduation_year: contact.education_graduation_year ?? null,
        company: contact.company ?? null,
        sectors,
        custom_sector: contact.custom_sector ?? null,
        work_experience: contact.work_experience ?? null,
        expertise,
        custom_expertise: contact.custom_expertise ?? null,
        custom_service: contact.custom_service ?? null,
        investments: contact.investments ?? null,
        personal_traits,
        values,
        goals: contact.goals ?? null,
        vision: contact.vision ?? null,
        interests: contact.interests ?? null,
        languages,
        custom_language: contact.custom_language ?? null,
        is_mentor: contact.is_mentor ?? null,
        volunteer_work: contact.volunteer_work ?? null,
        turning_points: contact.turning_points ?? null,
        challenges: contact.challenges ?? null,
        lessons: contact.lessons ?? null,
        future_goals: contact.future_goals ?? null,
        business_ideas: contact.business_ideas ?? null,
        investment_interest: contact.investment_interest ?? null,
        collaboration_areas: contact.collaboration_areas ?? null,
        parent_contact_id: contact.parent_contact_id ?? null,
      },
    });



    let rpcData, rpcError;
    try {
      const rpcResult = await admin.rpc("accept_invite_and_add_contact", {
        p_token: token,
        p_contact: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        city: contact.city ?? null,
        profession: contact.profession ?? null,
        relationship_degree: contact.relationship_degree,
        services,
        tags,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        description: contact.description ?? null,
        // New comprehensive fields
        age: contact.age ?? null,
        birth_city: contact.birth_city ?? null,
        current_city: contact.current_city ?? null,
        education_school: contact.education_school ?? null,
        education_department: contact.education_department ?? null,
        education_degree: contact.education_degree ?? null,
        education_graduation_year: contact.education_graduation_year ?? null,
        company: contact.company ?? null,
        sectors,
        custom_sector: contact.custom_sector ?? null,
        work_experience: contact.work_experience ?? null,
        expertise,
        custom_expertise: contact.custom_expertise ?? null,
        custom_service: contact.custom_service ?? null,
        investments: contact.investments ?? null,
        personal_traits,
        values,
        goals: contact.goals ?? null,
        vision: contact.vision ?? null,
        interests: contact.interests ?? null,
        languages,
        custom_language: contact.custom_language ?? null,
        is_mentor: contact.is_mentor ?? null,
        volunteer_work: contact.volunteer_work ?? null,
        turning_points: contact.turning_points ?? null,
        challenges: contact.challenges ?? null,
        lessons: contact.lessons ?? null,
        future_goals: contact.future_goals ?? null,
        business_ideas: contact.business_ideas ?? null,
        investment_interest: contact.investment_interest ?? null,
        collaboration_areas: contact.collaboration_areas ?? null,
        parent_contact_id: contact.parent_contact_id ?? null,
      },
      });
      rpcData = rpcResult.data;
      rpcError = rpcResult.error;
    } catch (error) {
      console.error("RPC call failed:", error);
      rpcError = { message: error.message || "RPC call failed" };
    }

    console.log("RPC result:", { rpcData, rpcError });

    if (rpcError) {
      const msg = rpcError.message || "İşlem gerçekleştirilemedi";
      console.error("RPC error:", msg);
      // Bilinen iş kuralı hatalarını 422 döndür
      const isBiz =
        /doğrulanmadı|inviter_contact_id|null|zincir|limit|kısıt|Geçersiz|kullanım hakkı|doğrulanmadı/i.test(msg);
      return new Response(JSON.stringify({ error: msg }), {
        status: isBiz ? 422 : 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // RPC fonksiyonu jsonb döndürür
    const result = rpcData;
    if (!result || !result.contact_id) {
      console.error("Unexpected RPC result structure:", rpcData);
      return new Response(JSON.stringify({ error: "Beklenmeyen dönüş yapısı" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Contact created successfully:", result);

    const insertedContactId: string = result.contact_id;

    // Davet + zincir bilgisi
    const { data: inviteData, error: inviteErr } = await admin
      .from("invites")
      .select(
        `
        owner_user_id,
        inviter_first_name,
        inviter_last_name,
        chain_id,
        invite_chains (
          status,
          remaining_uses,
          max_uses
        )
      `
      )
      .eq("token", token)
      .single();

    if (inviteErr) {
      // Bu hata kritik değil; sadece takip daveti için kullanıyoruz.
      console.warn("Invite fetch warning:", inviteErr.message);
    }

    // E-posta gönderim kontrolü
    const shouldSendEmail = shouldSendEmailFlag && contact.email && inviteData && 
      ((result.remaining_uses !== null && result.remaining_uses >= 0) || result.chain_status === "active");

    // Opsiyonel e‑posta (bilgi maili)
    if (shouldSendEmail) {
      try {
        const inviterFullName =
          [inviteData.inviter_first_name, inviteData.inviter_last_name]
            .filter(Boolean)
            .join(" ") || "Bir arkadaşınız";

        const contactFullName = `${contact.first_name} ${contact.last_name}`;

        // Bilgi maili gönder - kişiye Network GPT'ye eklendiğini bildir
        const subject = "Network GPT Ağına Eklendiğiniz Bildirimi";
        const html = `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Network GPT Ağına Hoş Geldiniz</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                max-width: 600px; 
                margin: 0 auto; 
                padding: 20px;
                background-color: #f8f9fa;
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .logo {
                font-size: 28px;
                font-weight: bold;
                color: #8B5CF6;
                margin-bottom: 10px;
              }
              .title {
                color: #1F2937;
                font-size: 24px;
                margin-bottom: 20px;
              }
              .content {
                color: #4B5563;
                margin-bottom: 25px;
              }
              .features {
                background: #F3F4F6;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
              }
              .features ul {
                margin: 0;
                padding-left: 20px;
              }
              .features li {
                margin-bottom: 8px;
                color: #374151;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                text-align: center;
                color: #6B7280;
                font-size: 14px;
              }
              .highlight {
                color: #8B5CF6;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🤖 Network GPT</div>
                <h1 class="title">Ağımıza Hoş Geldiniz!</h1>
              </div>
              
              <div class="content">
                <p>Merhaba <span class="highlight">${contactFullName}</span>!</p>
                
                <p><span class="highlight">${inviterFullName}</span> sizi Network GPT profesyonel ağına ekledi.</p>
                
                <div class="features">
                  <p><strong>Artık platform üzerinden:</strong></p>
                  <ul>
                    <li>📊 Profesyonel bağlantılarınızı yönetebilirsiniz</li>
                    <li>👥 Yeni kişiler ekleyebilirsiniz</li>
                    <li>🌐 Ağınızı genişletebilirsiniz</li>
                    <li>📝 İletişim bilgilerinizi güncelleyebilirsiniz</li>
                    <li>🤖 AI destekli analizler yapabilirsiniz</li>
                  </ul>
                </div>
                
                <p>Herhangi bir sorunuz olursa bu e-postaya yanıt verebilirsiniz.</p>
              </div>
              
              <div class="footer">
                <p>Bu e-posta Network GPT platformu tarafından gönderilmiştir.</p>
                <p>© 2024 Network GPT - AI Destekli Ağ Yönetimi</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendEmail(contact.email!, subject, html);
        console.log("Info email sent successfully to:", contact.email);

      } catch (mailErr) {
        console.error("Email send failed:", (mailErr as Error)?.message || mailErr);
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        contact: { id: insertedContactId },
        remaining_uses: result.remaining_uses ?? null,
        chain_status: result.chain_status ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("invite-submit-new error", e);
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
