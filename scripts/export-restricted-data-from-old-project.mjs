import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL ?? 'https://fvtnzndwstxrvaacgrwb.supabase.co';
const OLD_SUPABASE_SERVICE_ROLE_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY;

if (!OLD_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set OLD_SUPABASE_SERVICE_ROLE_KEY before running this restricted export.');
}

const adminClient = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const outputDir = path.resolve('supabase', 'data');
const exportJsonPath = path.join(outputDir, 'current_restricted_export.json');
const exportSqlPath = path.join(outputDir, 'current_restricted_export.sql');

const tableOrder = ['orders', 'contact_messages', 'admin_users', 'feedback'];
const exportedData = {};
const counts = {};

const sqlLiteral = (value) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
};

for (const tableName of tableOrder) {
    const { data, error } = await adminClient.from(tableName).select('*');

    if (error) {
        throw new Error(`${tableName}: ${error.message}`);
    }

    exportedData[tableName] = data ?? [];
    counts[tableName] = data?.length ?? 0;
}

const sections = [
    '-- Restricted/private data export from the old Supabase project',
    `-- Source: ${OLD_SUPABASE_URL}`,
    `-- Exported at: ${new Date().toISOString()}`,
    '',
    'BEGIN;',
    '',
];

for (const tableName of tableOrder) {
    const rows = exportedData[tableName] ?? [];

    if (!rows.length) {
        sections.push(`-- No rows exported for ${tableName}`);
        sections.push('');
        continue;
    }

    const columns = Object.keys(rows[0]);
    const values = rows.map((row) => `  (${columns.map((column) => sqlLiteral(row[column])).join(', ')})`).join(',\n');
    const updates = columns.filter((column) => column !== 'id').map((column) => `${column} = EXCLUDED.${column}`).join(',\n    ');

    sections.push(`INSERT INTO public.${tableName} (${columns.join(', ')})`);
    sections.push(`VALUES\n${values}`);
    sections.push(`ON CONFLICT (id) DO UPDATE SET\n    ${updates};`);
    sections.push('');
}

sections.push('COMMIT;');
sections.push('');

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(exportJsonPath, JSON.stringify({ sourceProjectUrl: OLD_SUPABASE_URL, counts, data: exportedData }, null, 2));
await fs.writeFile(exportSqlPath, sections.join('\n'));

console.log('Restricted export complete.');
console.log(JSON.stringify({ sourceProjectUrl: OLD_SUPABASE_URL, counts }, null, 2));
console.log(`JSON: ${exportJsonPath}`);
console.log(`SQL: ${exportSqlPath}`);
