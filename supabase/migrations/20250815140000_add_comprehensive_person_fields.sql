-- Add comprehensive person fields to contacts table
-- This migration adds all the new fields for the enhanced person profile system

-- Temel Bilgiler
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS age text,
ADD COLUMN IF NOT EXISTS birth_city text,
ADD COLUMN IF NOT EXISTS current_city text,
ADD COLUMN IF NOT EXISTS education_school text,
ADD COLUMN IF NOT EXISTS education_department text,
ADD COLUMN IF NOT EXISTS education_degree text,
ADD COLUMN IF NOT EXISTS education_graduation_year text;

-- İş ve Profesyonel Bilgiler
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS sectors text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_sector text,
ADD COLUMN IF NOT EXISTS work_experience text,
ADD COLUMN IF NOT EXISTS expertise text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_expertise text,
ADD COLUMN IF NOT EXISTS services text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_service text,
ADD COLUMN IF NOT EXISTS investments text;

-- Kişisel Özellikler
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS personal_traits text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS values text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals text,
ADD COLUMN IF NOT EXISTS vision text;

-- Sosyal ve Networking
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS interests text,
ADD COLUMN IF NOT EXISTS custom_interest text,
ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS custom_language text,
ADD COLUMN IF NOT EXISTS is_mentor boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS volunteer_work text;

-- Kritik Yaşam Deneyimleri
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS turning_points text,
ADD COLUMN IF NOT EXISTS challenges text,
ADD COLUMN IF NOT EXISTS lessons text;

-- İleriye Dönük Planlar
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS future_goals text,
ADD COLUMN IF NOT EXISTS business_ideas text,
ADD COLUMN IF NOT EXISTS investment_interest boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS collaboration_areas text;

-- Premium network visualization fields (if not already added)
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS handle text,
ADD COLUMN IF NOT EXISTS category text DEFAULT 'other' CHECK (category IN ('work', 'family', 'friend', 'other'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_sectors ON public.contacts USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_contacts_expertise ON public.contacts USING GIN(expertise);
CREATE INDEX IF NOT EXISTS idx_contacts_personal_traits ON public.contacts USING GIN(personal_traits);
CREATE INDEX IF NOT EXISTS idx_contacts_values ON public.contacts USING GIN(values);
CREATE INDEX IF NOT EXISTS idx_contacts_languages ON public.contacts USING GIN(languages);
CREATE INDEX IF NOT EXISTS idx_contacts_category ON public.contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON public.contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_birth_city ON public.contacts(birth_city);
CREATE INDEX IF NOT EXISTS idx_contacts_current_city ON public.contacts(current_city);
CREATE INDEX IF NOT EXISTS idx_contacts_is_mentor ON public.contacts(is_mentor);
CREATE INDEX IF NOT EXISTS idx_contacts_investment_interest ON public.contacts(investment_interest);

-- Update the existing contacts to have default values for new array fields
UPDATE public.contacts 
SET 
  sectors = COALESCE(sectors, '{}'),
  expertise = COALESCE(expertise, '{}'),
  personal_traits = COALESCE(personal_traits, '{}'),
  values = COALESCE(values, '{}'),
  interests = COALESCE(interests, NULL), -- Fixed: interests is text, not array
  languages = COALESCE(languages, '{}'),
  category = COALESCE(category, 'other')
WHERE 
  sectors IS NULL 
  OR expertise IS NULL 
  OR personal_traits IS NULL 
  OR values IS NULL 
  OR interests IS NULL 
  OR languages IS NULL 
  OR category IS NULL;
