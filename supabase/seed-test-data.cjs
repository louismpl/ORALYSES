const https = require('https');

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwampnbnlpY2dxcXl6eWd4amJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgyMDY5NSwiZXhwIjoyMDg2Mzk2Njk1fQ.3v-1eil4q8fS61w21C9-Cx-mCnWivenHPmVLKBDUx0Q';
const THERAPIST_ID = 'c69028f7-4d66-48e3-bf4d-3c7b82392110';

function apiCall(path, method, body) {
    return new Promise((resolve) => {
        const bodyStr = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'qpjjgnyicgqqyzygxjbc.supabase.co',
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': KEY,
                'Authorization': 'Bearer ' + KEY,
                'Prefer': 'return=representation',
                ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
            }
        };
        const req = https.request(opts, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(d) });
                } catch {
                    resolve({ status: res.statusCode, body: d });
                }
            });
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        if (bodyStr) req.write(bodyStr);
        req.end();
    });
}

async function main() {
    // Create parent user
    const userRes = await apiCall('/auth/v1/admin/users', 'POST', {
        email: 'parent@speechplay.fr',
        password: 'SpeechPlay2024!',
        email_confirm: true,
        user_metadata: { full_name: 'Sophie Martin', role: 'parent' }
    });

    if (!userRes.body.id) {
        console.log('Erreur creation parent:', JSON.stringify(userRes.body).slice(0, 200));
        return;
    }

    const parentId = userRes.body.id;
    console.log('Parent cree:', userRes.body.email, '| ID:', parentId);

    // Insert parent profile
    const profileRes = await apiCall('/rest/v1/profiles', 'POST', {
        id: parentId,
        full_name: 'Sophie Martin',
        role: 'parent',
        email: 'parent@speechplay.fr'
    });
    console.log('Profil parent:', profileRes.status, JSON.stringify(profileRes.body).slice(0, 100));

    // Create patient linked to therapist AND parent
    const patientRes = await apiCall('/rest/v1/patients', 'POST', {
        therapist_id: THERAPIST_ID,
        parent_id: parentId,
        first_name: 'Emma',
        age: 7,
        goals: ['articulation', 'vocabulaire']
    });

    if (patientRes.status !== 201) {
        console.log('Erreur patient:', JSON.stringify(patientRes.body).slice(0, 200));
        return;
    }

    const patient = patientRes.body[0];
    console.log('Patient Emma cree | Code liaison:', patient.link_code);

    // Get all games
    const gamesRes = await apiCall('/rest/v1/games?select=id,name', 'GET', null);
    for (const game of gamesRes.body) {
        const aRes = await apiCall('/rest/v1/assignments', 'POST', {
            patient_id: patient.id,
            game_id: game.id,
            therapist_id: THERAPIST_ID,
            difficulty_level: 1,
            active: true
        });
        console.log('Jeu assigne:', game.name, '| Status:', aRes.status);
    }

    console.log('\nDone! Comptes de test:');
    console.log('  Therapeute: therapiste@speechplay.fr / SpeechPlay2024!');
    console.log('  Parent:     parent@speechplay.fr / SpeechPlay2024!');
}

main().catch(console.error);
