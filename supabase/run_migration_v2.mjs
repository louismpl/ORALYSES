// supabase/run_migration_v2.mjs
// Execute: node supabase/run_migration_v2.mjs

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://genexqtcuwpdminlkugm.supabase.co";
const SERVICE_ROLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlbmV4cXRjdXdwZG1pbmxrdWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ0Mjc1OCwiZXhwIjoyMDg3MDE4NzU4fQ.6oXox2kXMDQ_lX2tI08b9MBaEcGfqs0mg20b-5gc9eU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

// ─── Execute SQL via Supabase Management API ──────────────────────────────────
async function runSQL(sql) {
    const projectRef = "genexqtcuwpdminlkugm";
    const res = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
        }
    );
    const text = await res.text();
    return { status: res.status, body: text };
}

// ─── Check existence via Supabase REST ────────────────────────────────────────
async function checkTable(table) {
    const { error } = await supabase.from(table).select("id").limit(1);
    return !error || !error.message.includes("does not exist");
}

async function checkColumn(table, column) {
    const { error } = await supabase.from(table).select(column).limit(1);
    return !error || !error.message.toLowerCase().includes(column.toLowerCase());
}

async function main() {
    console.log("🚀 Migration v2 — Oralyses\n");
    const results = { ok: [], missing: [] };

    // ── 1. mood in game_sessions ───────────────────────────────────────────────
    process.stdout.write("1️⃣  mood dans game_sessions ... ");
    const hasMood = await checkColumn("game_sessions", "mood");
    if (hasMood) {
        console.log("✅ présente");
        results.ok.push("game_sessions.mood");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push("ALTER TABLE public.game_sessions ADD COLUMN IF NOT EXISTS mood SMALLINT CHECK (mood BETWEEN 1 AND 5);");
    }

    // ── 2. custom_config_id in assignments ────────────────────────────────────
    process.stdout.write("2️⃣  custom_config_id dans assignments ... ");
    const hasCustom = await checkColumn("assignments", "custom_config_id");
    if (hasCustom) {
        console.log("✅ présente");
        results.ok.push("assignments.custom_config_id");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push("ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS custom_config_id UUID REFERENCES public.custom_game_configs(id) ON DELETE SET NULL;");
    }

    // ── 3. Table cabinets ─────────────────────────────────────────────────────
    process.stdout.write("3️⃣  Table cabinets ... ");
    const hasCabinets = await checkTable("cabinets");
    if (hasCabinets) {
        console.log("✅ présente");
        results.ok.push("table cabinets");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push(`CREATE TABLE IF NOT EXISTS public.cabinets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Cabinet',
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code_1 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_2 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_3 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_4 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  invite_code_5 TEXT UNIQUE DEFAULT upper(encode(gen_random_bytes(3), 'hex')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`);
    }

    // ── 4. cabinet_id in profiles ─────────────────────────────────────────────
    process.stdout.write("4️⃣  cabinet_id dans profiles ... ");
    const hasCabinetId = await checkColumn("profiles", "cabinet_id");
    if (hasCabinetId) {
        console.log("✅ présente");
        results.ok.push("profiles.cabinet_id");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cabinet_id UUID REFERENCES public.cabinets(id) ON DELETE SET NULL;");
    }

    // ── 5. is_cabinet_admin in profiles ──────────────────────────────────────
    process.stdout.write("5️⃣  is_cabinet_admin dans profiles ... ");
    const hasAdmin = await checkColumn("profiles", "is_cabinet_admin");
    if (hasAdmin) {
        console.log("✅ présente");
        results.ok.push("profiles.is_cabinet_admin");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_cabinet_admin BOOLEAN NOT NULL DEFAULT false;");
    }

    // ── 6. plan in profiles ──────────────────────────────────────────────────
    process.stdout.write("6️⃣  plan dans profiles ... ");
    const hasPlan = await checkColumn("profiles", "plan");
    if (hasPlan) {
        console.log("✅ présente");
        results.ok.push("profiles.plan");
    } else {
        console.log("❌ MANQUANTE");
        results.missing.push("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';");
    }

    // ── Résumé ─────────────────────────────────────────────────────────────────
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if (results.missing.length === 0) {
        console.log("🎉 Tout est à jour ! Aucune migration nécessaire.\n");
        return;
    }

    console.log(`\n⚠️  ${results.missing.length} éléments manquants.`);
    console.log("\n📋 Copiez et exécutez ce SQL dans Supabase:");
    console.log("   https://supabase.com/dashboard/project/genexqtcuwpdminlkugm/sql/new\n");
    console.log("┌─────────────────────────────────────────────────────┐");
    results.missing.forEach(sql => {
        console.log(sql);
        console.log("");
    });
    console.log("└─────────────────────────────────────────────────────┘");

    // Essayer via RPC exec_sql si disponible
    console.log("\n🔄 Tentative d'exécution automatique via RPC exec_sql...");
    let anySucceeded = false;
    for (const sql of results.missing) {
        const { error } = await supabase.rpc("exec_sql", { sql }).catch(e => ({ error: e }));
        if (!error) {
            console.log(`  ✅ Exécuté: ${sql.slice(0, 60)}...`);
            anySucceeded = true;
        } else {
            console.log(`  ⚠️  RPC non disponible pour: ${sql.slice(0, 60)}...`);
        }
    }

    if (anySucceeded) {
        console.log("\n✅ Migration partielle réussie via RPC !");
    } else {
        console.log("\n💡 La fonction RPC exec_sql n'est pas activée.");
        console.log("   Exécutez le SQL ci-dessus manuellement dans l'éditeur Supabase.");
        console.log("   Ou exécutez le fichier complet: supabase/migration_v2.sql");
    }
}

main().catch(console.error);
