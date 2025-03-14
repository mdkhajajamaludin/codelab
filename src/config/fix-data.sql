-- Fix requirements column for assignments where it's stored as a JSON string
UPDATE assignments
SET requirements = CASE
    WHEN requirements IS NULL THEN '{}'::TEXT[]
    WHEN requirements = '[]'::TEXT[] THEN '{}'::TEXT[]
    WHEN requirements::TEXT LIKE '[%]' THEN 
        (SELECT array_agg(value) FROM json_array_elements_text(requirements::TEXT::JSON))
    ELSE requirements
END
WHERE requirements IS NOT NULL;

-- Fix tags column for assignments where it's stored as a JSON string
UPDATE assignments
SET tags = CASE
    WHEN tags IS NULL THEN '{}'::TEXT[]
    WHEN tags = '[]'::TEXT[] THEN '{}'::TEXT[]
    WHEN tags::TEXT LIKE '[%]' THEN 
        (SELECT array_agg(value) FROM json_array_elements_text(tags::TEXT::JSON))
    ELSE tags
END
WHERE tags IS NOT NULL;

-- Make sure default_code is not null
UPDATE assignments
SET default_code = ''
WHERE default_code IS NULL;

-- Make sure hints is not null
UPDATE assignments
SET hints = ''
WHERE hints IS NULL;

-- Make sure all required fields have values
UPDATE assignments
SET 
    difficulty = 'Medium' WHERE difficulty IS NULL OR difficulty = '',
    language = 'javascript' WHERE language IS NULL OR language = '',
    time_estimate = '30 minutes' WHERE time_estimate IS NULL OR time_estimate = '',
    points = 50 WHERE points IS NULL OR points = 0;

-- Log the fixed data
SELECT id, title, requirements, tags, default_code FROM assignments; 