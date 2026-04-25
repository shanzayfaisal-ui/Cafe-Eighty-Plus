import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.SETUP_ADMIN_EMAIL;
const password = process.env.SETUP_ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the environment.');
}

if (!email || !password) {
    throw new Error('Set SETUP_ADMIN_EMAIL and SETUP_ADMIN_PASSWORD before running this script.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

const signUpResult = await supabase.auth.signUp({
    email,
    password,
});

const signInResult = await supabase.auth.signInWithPassword({
    email,
    password,
});

const userId = signUpResult.data.user?.id || signInResult.data.user?.id || null;
const outputDir = path.resolve('supabase', 'data');
const sqlFilePath = path.join(outputDir, `authorize-admin-${email.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.sql`);

await fs.mkdir(outputDir, { recursive: true });

const sql = userId
    ? `insert into public.admin_users (id, email)\nvalues ('${userId}', '${email}')\non conflict do nothing;\n`
    : `-- User ID was not returned automatically.\n-- After confirming the user in Supabase Auth, run:\n-- insert into public.admin_users (id, email)\n-- select id, email from auth.users where email = '${email}'\n-- on conflict do nothing;\n`;

await fs.writeFile(sqlFilePath, sql);

console.log(JSON.stringify({
    supabaseUrl,
    email,
    signUp: {
        error: signUpResult.error?.message ?? null,
        userId: signUpResult.data.user?.id ?? null,
        emailConfirmedAt: signUpResult.data.user?.email_confirmed_at ?? null,
        sessionReturned: Boolean(signUpResult.data.session),
    },
    signIn: {
        error: signInResult.error?.message ?? null,
        userId: signInResult.data.user?.id ?? null,
        sessionReturned: Boolean(signInResult.data.session),
    },
    authorizeAdminSqlFile: sqlFilePath,
    authorizeAdminSql: sql,
}, null, 2));
