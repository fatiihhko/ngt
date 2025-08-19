-- Fix interests field that was incorrectly set to '{}' instead of NULL
-- This migration cleans up the interests field for existing contacts

UPDATE public.contacts 
SET interests = NULL 
WHERE interests = '{}';

-- Also clean up any other invalid interests values
UPDATE public.contacts 
SET interests = NULL 
WHERE interests = '[]' OR interests = 'null' OR interests = 'undefined' OR interests = '';
