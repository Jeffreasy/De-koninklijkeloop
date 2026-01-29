-- RUN THIS IN YOUR DATABASE SQL EDITOR

-- 1. Link Jeffrey to the Tenant (Fixes the login crash)
UPDATE users 
SET default_tenant_id = 'b2727666-7230-4689-b58b-ceab8c2898d5',
    is_email_verified = true
WHERE email = 'jeffrey@dekoninklijkeloop.nl';

-- 2. Ensure Admin Membership exists
INSERT INTO memberships (user_id, tenant_id, role, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'jeffrey@dekoninklijkeloop.nl'),
    'b2727666-7230-4689-b58b-ceab8c2898d5',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
