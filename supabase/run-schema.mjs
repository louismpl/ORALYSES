// Script pour exécuter le schema SQL sur Supabase
// Usage: node supabase/run-schema.mjs

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://qpjjgnyicgqqyzygxjbc.supabase.co";
const SERVICE_ROLE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwampnbnlpY2dxcXl6eWd4amJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgyMDY5NSwiZXhwIjoyMDg2Mzk2Njk1fQ.3v-1eil4q8fS61w21C9-Cx-mCnWivenHPmVLKBDUx0Q";

const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");

// Split into individual statements (skip empty lines and comments)
const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

console.log(`📦 Exécution de ${statements.length} statements SQL...`);

let success = 0;
let errors = 0;

for (const stmt of statements) {
    const fullStmt = stmt + ";";

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: "POST",
            headers: {
                apikey: SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
            },
            body: JSON.stringify({ query: fullStmt }),
        });

        success++;
    } catch (e) {
        errors++;
        console.error(`❌ Erreur:`, e.message);
    }
}

console.log(`✅ Terminé: ${success} succès, ${errors} erreurs`);
