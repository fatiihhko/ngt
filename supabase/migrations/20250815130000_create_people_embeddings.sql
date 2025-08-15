-- Create people_embeddings table for storing AI embeddings
CREATE TABLE IF NOT EXISTS public.people_embeddings (
  id uuid PRIMARY KEY REFERENCES public.contacts(id) ON DELETE CASCADE,
  embedding jsonb NOT NULL,
  text text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  expertise text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  locations text[] NOT NULL DEFAULT '{}',
  roles text[] NOT NULL DEFAULT '{}',
  domain text NOT NULL DEFAULT 'genel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.people_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contact embeddings" ON public.people_embeddings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = people_embeddings.id 
    AND contacts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own contact embeddings" ON public.people_embeddings
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = people_embeddings.id 
    AND contacts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own contact embeddings" ON public.people_embeddings
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = people_embeddings.id 
    AND contacts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own contact embeddings" ON public.people_embeddings
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.contacts 
    WHERE contacts.id = people_embeddings.id 
    AND contacts.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_embeddings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_people_embeddings_updated_at
BEFORE UPDATE ON public.people_embeddings
FOR EACH ROW
EXECUTE FUNCTION public.update_embeddings_updated_at();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_people_embeddings_domain ON public.people_embeddings(domain);
CREATE INDEX IF NOT EXISTS idx_people_embeddings_skills ON public.people_embeddings USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_people_embeddings_roles ON public.people_embeddings USING GIN(roles);
