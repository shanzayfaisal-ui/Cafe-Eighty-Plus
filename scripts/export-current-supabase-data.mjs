import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const OLD_SUPABASE_URL = process.env.OLD_SUPABASE_URL ?? 'https://fvtnzndwstxrvaacgrwb.supabase.co';
const OLD_SUPABASE_ANON_KEY =
    process.env.OLD_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dG56bmR3c3R4cnZhYWNncndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDQzMTcsImV4cCI6MjA5MDEyMDMxN30.sewwYGSIwoSDxOtYHtBU_0oFqEN7dwbUG1yI0CqruVU';

const supabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const outputDir = path.resolve('supabase', 'data');
const exportJsonPath = path.join(outputDir, 'current_public_export.json');
const exportSqlPath = path.join(outputDir, 'current_public_export.sql');
const exportSummaryPath = path.join(outputDir, 'current_public_export_summary.json');

const tableConfigs = [
    { name: 'menu_categories', order: [['display_order', true]] },
    { name: 'menu_items', order: [['display_order', true]] },
    { name: 'best_sellers', order: [['display_order', true]] },
    { name: 'gallery', order: [['display_order', true]] },
    { name: 'coffee_guide', order: [['display_order', true]] },
    { name: 'feedback', order: [['created_at', false]] },
];

const inaccessibleNotes = {
    admin_users: 'Protected by RLS and requires authenticated admin access on the source project.',
    orders: 'Not publicly readable on the source project; requires authenticated/admin access to export.',
    contact_messages: 'Not publicly readable on the source project; requires authenticated/admin access to export.',
    feedback_pending: 'Only approved feedback rows are visible publicly because of RLS.',
};

const sqlLiteral = (value) => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
};

const buildUpsertSql = (tableName, rows) => {
    if (!rows.length) {
        return `-- No rows exported for public.${tableName}\n`;
    }

    const columns = Object.keys(rows[0]);
    const valuesSql = rows
        .map((row) => `  (${columns.map((column) => sqlLiteral(row[column])).join(', ')})`)
        .join(',\n');

    const updateColumns = columns.filter((column) => column !== 'id');
    const updateSql = updateColumns.length
        ? updateColumns.map((column) => `${column} = EXCLUDED.${column}`).join(',\n    ')
        : 'id = EXCLUDED.id';

    return `INSERT INTO public.${tableName} (${columns.join(', ')})\nVALUES\n${valuesSql}\nON CONFLICT (id) DO UPDATE SET\n    ${updateSql};\n`;
};

const fetchTable = async ({ name, order }) => {
    let query = supabase.from(name).select('*');

    for (const [column, ascending] of order) {
        query = query.order(column, { ascending });
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`${name}: ${error.message}`);
    }

    return data ?? [];
};

await fs.mkdir(outputDir, { recursive: true });

const exportedData = {};
const counts = {};

for (const tableConfig of tableConfigs) {
    const rows = await fetchTable(tableConfig);
    exportedData[tableConfig.name] = rows;
    counts[tableConfig.name] = rows.length;
}

const summary = {
    sourceProjectUrl: OLD_SUPABASE_URL,
    exportedAt: new Date().toISOString(),
    counts,
    inaccessibleNotes,
};

const sqlSections = [
    '-- =====================================================',
    '-- Cafe Eighty Plus public data export from the previous Supabase project',
    `-- Source: ${OLD_SUPABASE_URL}`,
    `-- Exported at: ${summary.exportedAt}`,
    '-- Run AFTER the schema/bootstrap SQL on the new project.',
    '-- =====================================================',
    '',
    'BEGIN;',
    '',
];

for (const tableConfig of tableConfigs) {
    sqlSections.push(`-- Data for public.${tableConfig.name}`);
    sqlSections.push(buildUpsertSql(tableConfig.name, exportedData[tableConfig.name]));
}

sqlSections.push('COMMIT;');
sqlSections.push('');

await fs.writeFile(exportJsonPath, JSON.stringify(exportedData, null, 2));
await fs.writeFile(exportSummaryPath, JSON.stringify(summary, null, 2));
await fs.writeFile(exportSqlPath, sqlSections.join('\n'));

console.log('Export complete.');
console.log(JSON.stringify(summary, null, 2));
console.log(`JSON: ${exportJsonPath}`);
console.log(`SQL: ${exportSqlPath}`);
