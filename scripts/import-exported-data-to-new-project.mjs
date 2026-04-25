import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const NEW_SUPABASE_SERVICE_ROLE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;
const PUBLIC_EXPORT_PATH = path.resolve('supabase', 'data', 'current_public_export.json');
const RESTRICTED_EXPORT_PATH = path.resolve('supabase', 'data', 'current_restricted_export.json');

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY before running this script.');
}

const adminClient = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const publicExport = JSON.parse(await fs.readFile(PUBLIC_EXPORT_PATH, 'utf8'));
let restrictedExport = {};

try {
    const restrictedRaw = JSON.parse(await fs.readFile(RESTRICTED_EXPORT_PATH, 'utf8'));
    restrictedExport = restrictedRaw.data ?? restrictedRaw;
} catch {
    restrictedExport = {};
}

const exportData = {
    ...publicExport,
    ...restrictedExport,
};

const tableOrder = [
    'menu_categories',
    'menu_items',
    'best_sellers',
    'gallery',
    'coffee_guide',
    'feedback',
    'orders',
    'contact_messages',
    'admin_users',
];
const summary = [];

for (const tableName of tableOrder) {
    const rows = exportData[tableName] ?? [];

    if (!rows.length) {
        summary.push({ table: tableName, count: 0, status: 'skipped' });
        continue;
    }

    const { error } = await adminClient.from(tableName).upsert(rows, { onConflict: 'id' });

    if (error) {
        throw new Error(`${tableName}: ${error.message}`);
    }

    summary.push({ table: tableName, count: rows.length, status: 'imported' });
    console.log(`Imported ${rows.length} rows into ${tableName}`);
}

const outputPath = path.resolve('supabase', 'data', 'new_project_import_results.json');
await fs.writeFile(outputPath, JSON.stringify(summary, null, 2));
console.log(`Import complete. Results written to ${outputPath}`);
