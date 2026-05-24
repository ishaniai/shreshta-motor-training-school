# Supabase migrations

## Apply migration

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**.  
2. Paste and run the contents of:

   `migrations/20250518000000_create_users_table.sql`

3. Confirm the `users` table exists under **Table Editor**.

## Notes

- `password_hash` is stored in the app `users` table (custom auth flow in step 2). Supabase Auth can be linked later if needed.  
- Row Level Security is enabled with policies prepared for the Express service role / future RPC checks.  
- Username uniqueness is enforced at the database level.
