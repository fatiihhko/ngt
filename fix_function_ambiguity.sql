-- Fix function ambiguity by dropping duplicate functions
-- Run this in your Supabase SQL editor

-- Drop all versions of the function
DROP FUNCTION IF EXISTS public.add_member_via_invite_link(text, uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.add_member_via_invite_link(text, text, jsonb, uuid);

-- Recreate the function with clear signature
CREATE OR REPLACE FUNCTION public.add_member_via_invite_link(
  p_token text,
  p_member_email text,
  p_contact_data jsonb,
  p_inviter_user_id uuid DEFAULT NULL
)
RETURNS TABLE(success boolean, contact_id uuid, remaining_slots integer, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_invite_link public.invite_links%ROWTYPE;
  v_contact_id uuid;
  v_remaining integer;
BEGIN
  -- Debug: Log the interests value
  RAISE LOG 'add_member_via_invite_link Debug - p_contact_data: %', p_contact_data;
  RAISE LOG 'add_member_via_invite_link Debug - interests value: %', p_contact_data->>'interests';
  RAISE LOG 'add_member_via_invite_link Debug - interests type: %', jsonb_typeof(p_contact_data->'interests');
  
  -- Lock the invite link row
  SELECT * INTO v_invite_link
  FROM public.invite_links
  WHERE token = p_token AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::uuid, 0, 'Geçersiz veya devre dışı davet bağlantısı';
    RETURN;
  END IF;

  -- Check if limit reached (0 = unlimited)
  IF v_invite_link.limit_count > 0 AND v_invite_link.used_count >= v_invite_link.limit_count THEN
    RETURN QUERY SELECT false, null::uuid, (v_invite_link.limit_count - v_invite_link.used_count), 'Davet bağlantısı kullanım limitine ulaştı';
    RETURN;
  END IF;

  -- Check if email already exists for this invite link
  IF EXISTS (
    SELECT 1 FROM public.invite_members 
    WHERE invite_link_id = v_invite_link.id 
    AND member_email = p_member_email
  ) THEN
    RETURN QUERY SELECT false, null::uuid, (v_invite_link.limit_count - v_invite_link.used_count), 'Bu e-posta adresi zaten bu davet bağlantısı ile eklenmiş';
    RETURN;
  END IF;

  -- Create the contact
  INSERT INTO public.contacts (
    user_id,
    first_name,
    last_name,
    city,
    profession,
    relationship_degree,
    services,
    tags,
    phone,
    email,
    description,
    age,
    education_school,
    education_degree,
    education_field,
    sectors,
    expertise,
    personal_traits,
    values,
    languages,
    interests,
    volunteer_work,
    turning_points
  ) VALUES (
    v_invite_link.created_by_user_id,
    COALESCE(p_contact_data->>'first_name', ''),
    COALESCE(p_contact_data->>'last_name', ''),
    NULLIF(p_contact_data->>'city', ''),
    NULLIF(p_contact_data->>'profession', ''),
    COALESCE((p_contact_data->>'relationship_degree')::int, 0),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'services')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'tags')), ARRAY[]::text[]),
    NULLIF(p_contact_data->>'phone', ''),
    NULLIF(p_contact_data->>'email', ''),
    NULLIF(p_contact_data->>'description', ''),
    NULLIF((p_contact_data->>'age')::int, 0),
    NULLIF(p_contact_data->>'education_school', ''),
    NULLIF(p_contact_data->>'education_degree', ''),
    NULLIF(p_contact_data->>'education_field', ''),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'sectors')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'expertise')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'personal_traits')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'values')), ARRAY[]::text[]),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_contact_data->'languages')), ARRAY[]::text[]),
    NULLIF(p_contact_data->>'interests', ''),
    NULLIF(p_contact_data->>'volunteer_work', ''),
    NULLIF(p_contact_data->>'turning_points', '')
  )
  RETURNING id INTO v_contact_id;

  -- Add to invite_members table
  INSERT INTO public.invite_members (
    invite_link_id,
    inviter_user_id,
    member_email,
    contact_id
  ) VALUES (
    v_invite_link.id,
    p_inviter_user_id,
    p_member_email,
    v_contact_id
  );

  -- Increment used_count
  UPDATE public.invite_links 
  SET used_count = used_count + 1
  WHERE id = v_invite_link.id;

  -- Calculate remaining slots (0 = unlimited)
  IF v_invite_link.limit_count = 0 THEN
    v_remaining := NULL; -- Unlimited
  ELSE
    v_remaining := v_invite_link.limit_count - (v_invite_link.used_count + 1);
  END IF;

  RETURN QUERY SELECT true, v_contact_id, v_remaining, null::text;
END;
$function$;
