-- Fix any remaining interests values that are still '{}' as strings
-- This migration handles cases where the previous migration didn't catch all instances

UPDATE public.contacts 
SET interests = NULL 
WHERE interests = '{}' OR interests = '[]' OR interests = 'null' OR interests = 'undefined' OR interests = '';

-- Also handle any whitespace-only values
UPDATE public.contacts 
SET interests = NULL 
WHERE interests IS NOT NULL AND TRIM(interests) = '';

-- Log how many records were updated
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE LOG 'Updated % contacts with invalid interests values', updated_count;
END $$;
