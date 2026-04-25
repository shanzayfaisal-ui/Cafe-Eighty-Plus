import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const NEW_SUPABASE_URL = process.env.NEW_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const NEW_SUPABASE_SERVICE_ROLE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;
const EXPORT_PATH = path.resolve('supabase', 'data', 'current_public_export.json');
const PRODUCT_BUCKET_NAME = 'product-images';
const GALLERY_BUCKET_NAME = 'Gallery';

if (!NEW_SUPABASE_URL || !NEW_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_ROLE_KEY before running this script.');
}

const adminClient = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const exportData = JSON.parse(await fs.readFile(EXPORT_PATH, 'utf8'));
const products = (exportData.menu_items ?? []).filter((product) => Boolean(product.image_url));
const galleryItems = (exportData.gallery ?? []).filter((item) => Boolean(item.image_url));

const results = [];

const migrateFile = async ({ recordType, id, name, sourceUrl, bucketName, targetPath, updateTable, updatePayload }) => {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
        throw new Error(`Failed to download ${sourceUrl} (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';

    const { error: uploadError } = await adminClient.storage.from(bucketName).upload(targetPath, arrayBuffer, {
        contentType,
        upsert: true,
    });

    if (uploadError) {
        throw uploadError;
    }

    const { data: publicUrlData } = adminClient.storage.from(bucketName).getPublicUrl(targetPath);
    const payload = updatePayload(publicUrlData.publicUrl, targetPath);

    const { error: updateError } = await adminClient.from(updateTable).update(payload).eq('id', id);

    if (updateError) {
        throw updateError;
    }

    results.push({ recordType, id, name, status: 'migrated', targetPath, bucketName });
    console.log(`Migrated ${recordType} asset for ${name}`);
};

for (const product of products) {
    try {
        await migrateFile({
            recordType: 'menu_item',
            id: product.id,
            name: product.name,
            sourceUrl: product.image_url,
            bucketName: PRODUCT_BUCKET_NAME,
            targetPath: product.image_path || `${product.id}/${Date.now()}-migrated-image`,
            updateTable: 'menu_items',
            updatePayload: (publicUrl, targetPath) => ({ image_url: publicUrl, image_path: targetPath }),
        });
    } catch (error) {
        results.push({
            recordType: 'menu_item',
            id: product.id,
            name: product.name,
            status: 'failed',
            message: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed to migrate image for ${product.name}:`, error);
    }
}

for (const item of galleryItems) {
    try {
        const fileName = decodeURIComponent(new URL(item.image_url).pathname.split('/').pop() || `${item.id}.jpg`);

        await migrateFile({
            recordType: 'gallery',
            id: item.id,
            name: item.title || item.alt || item.id,
            sourceUrl: item.image_url,
            bucketName: GALLERY_BUCKET_NAME,
            targetPath: fileName,
            updateTable: 'gallery',
            updatePayload: (publicUrl) => ({ image_url: publicUrl }),
        });
    } catch (error) {
        results.push({
            recordType: 'gallery',
            id: item.id,
            name: item.title || item.alt || item.id,
            status: 'failed',
            message: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed to migrate gallery image for ${item.title || item.id}:`, error);
    }
}

const outputPath = path.resolve('supabase', 'data', 'product_image_migration_results.json');
await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
console.log(`Finished. Results written to ${outputPath}`);
