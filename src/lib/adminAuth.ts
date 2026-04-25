import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AdminAccessState {
    session: Session | null;
    user: User | null;
    isAdmin: boolean;
}

const adminEmailsEnv = (
    import.meta.env as ImportMetaEnv & { VITE_ADMIN_EMAILS?: string }
).VITE_ADMIN_EMAILS ?? '';

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? '';

const getConfiguredAdminEmails = () =>
    adminEmailsEnv
        .split(',')
        .map((email) => normalizeEmail(email))
        .filter(Boolean);

export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session ?? null;
}

export async function getCurrentUser() {
    const session = await getCurrentSession();
    return session?.user ?? null;
}

export async function isAuthorizedAdmin(user: User | null) {
    if (!user?.email) {
        return false;
    }

    const normalizedEmail = normalizeEmail(user.email);
    const configuredAdminEmails = getConfiguredAdminEmails();

    if (configuredAdminEmails.includes(normalizedEmail)) {
        return true;
    }

    try {
        const { data: adminById, error: adminByIdError } = await supabase
            .from('admin_users')
            .select('id, email')
            .eq('id', user.id)
            .maybeSingle();

        if (adminByIdError && adminByIdError.code !== 'PGRST116') {
            throw adminByIdError;
        }

        if (adminById) {
            return true;
        }

        const { data: adminByEmail, error: adminByEmailError } = await supabase
            .from('admin_users')
            .select('id, email')
            .ilike('email', normalizedEmail)
            .maybeSingle();

        if (adminByEmailError && adminByEmailError.code !== 'PGRST116') {
            throw adminByEmailError;
        }

        return Boolean(adminByEmail);
    } catch (error) {
        console.warn('Admin authorization check failed.', error);
        return false;
    }
}

export async function getAdminAccessState(): Promise<AdminAccessState> {
    const session = await getCurrentSession();
    const user = session?.user ?? null;

    if (!session || !user) {
        return {
            session: null,
            user: null,
            isAdmin: false,
        };
    }

    const isAdmin = await isAuthorizedAdmin(user);

    return {
        session,
        user,
        isAdmin,
    };
}

export async function signInAdmin(email: string, password: string) {
    return supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
}

export async function signOutAdmin() {
    return supabase.auth.signOut();
}

interface UpdateAdminCredentialsInput {
    email?: string;
    password?: string;
}

export async function updateAdminCredentials({ email, password }: UpdateAdminCredentialsInput) {
    const session = await getCurrentSession();

    if (!session?.user) {
        throw new Error('Your session has expired. Please sign in again.');
    }

    const updates: { email?: string; password?: string } = {};
    const normalizedEmail = normalizeEmail(email);
    const trimmedPassword = password?.trim();

    if (normalizedEmail) {
        updates.email = normalizedEmail;
    }

    if (trimmedPassword) {
        updates.password = trimmedPassword;
    }

    if (!updates.email && !updates.password) {
        throw new Error('Enter a new email or password to continue.');
    }

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
        throw error;
    }

    if (updates.email) {
        const { error: adminUserError } = await supabase.from('admin_users').upsert(
            {
                id: session.user.id,
                email: updates.email,
            },
            {
                onConflict: 'id',
            },
        );

        if (adminUserError) {
            throw adminUserError;
        }
    }

    return data.user;
}

export function onAdminAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
        callback(session);
    });
}
