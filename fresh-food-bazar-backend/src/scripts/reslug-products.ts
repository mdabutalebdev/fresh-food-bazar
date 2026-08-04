/**
 * Migration: give every product a clean, human-readable slug (no timestamp).
 *
 *   "Women's Lawn Kameez — Summer 2025"  →  "womens-lawn-kameez-summer-2025"
 *
 * Products that share a name get -2, -3, … suffixes. Oldest product keeps the
 * plain slug. Safe to run more than once (idempotent).
 *
 * Run:  npx ts-node src/scripts/reslug-products.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || '';

// Must match the slug rule in product.model.ts's pre-save hook.
const toBaseSlug = (name: string): string =>
    (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';

async function reslugProducts() {
    try {
        if (!MONGODB_URI) throw new Error('DATABASE_URL (or MONGODB_URI) is not set in .env');

        console.log('🔄 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            console.error('❌ Database connection not available');
            process.exit(1);
        }

        const products = db.collection('products');

        // Oldest first → the earliest product keeps the plain slug when names clash.
        const all = await products.find({}).sort({ createdAt: 1 }).toArray();
        console.log(`📦 Found ${all.length} products`);

        if (all.length === 0) {
            console.log('Nothing to do.');
            return;
        }

        // Phase 1 — park each slug at a guaranteed-unique temp value, so Phase 2 can
        // assign the real slugs in any order without tripping the unique index.
        console.log('🅿️  Phase 1: parking slugs at temporary values...');
        for (const p of all) {
            await products.updateOne({ _id: p._id }, { $set: { slug: `__migrating_${p._id}` } });
        }

        // Phase 2 — assign clean, globally-unique slugs.
        console.log('✍️  Phase 2: writing clean slugs...');
        const used = new Set<string>();
        let changed = 0;

        for (const p of all) {
            const base = toBaseSlug(p.name);
            let slug = base;
            let n = 2;
            while (used.has(slug)) slug = `${base}-${n++}`;
            used.add(slug);

            await products.updateOne({ _id: p._id }, { $set: { slug } });

            if (slug !== p.slug) {
                changed++;
                console.log(`  ✅ ${p.slug ?? '(none)'}  →  ${slug}`);
            }
        }

        console.log(`\n🎉 Done. ${changed} of ${all.length} slugs updated.`);
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔒 Disconnected from database');
        process.exit(0);
    }
}

reslugProducts();
