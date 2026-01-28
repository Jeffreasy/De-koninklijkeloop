-- RUN THIS IN YOUR DATABASE SQL EDITOR

-- 1. Link Jeffrey to the Tenant (Fixes the login crash)
UPDATE users 
SET default_tenant_id = 'c3888c7e-44cf-4827-9a7d-adaae2a1a095',
    is_email_verified = true
WHERE email = 'jeffrey@dekoninklijkeloop.nl';

-- 2. Ensure Admin Membership exists
INSERT INTO memberships (user_id, tenant_id, role, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE email = 'jeffrey@dekoninklijkeloop.nl'),
    'c3888c7e-44cf-4827-9a7d-adaae2a1a095',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
