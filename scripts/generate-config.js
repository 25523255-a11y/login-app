// ============================================================================
// GENERATE CONFIG - scripts/generate-config.js
//
// Script ini dijalankan otomatis oleh Vercel saat proses build (lihat
// "build" di package.json dan "buildCommand" di vercel.json).
//
// Tujuannya: membaca environment variable SUPABASE_URL dan
// SUPABASE_ANON_KEY yang diatur di dashboard Vercel, lalu menuliskannya
// ke file js/config.js -- supaya Anon Key TIDAK pernah ditulis manual
// (hardcode) di source code yang di-commit ke GitHub.
//
// Tidak butuh dependency npm apa pun (hanya modul bawaan Node.js "fs").
// ============================================================================

const fs = require("fs");
const path = require("path");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[generate-config] PERINGATAN: SUPABASE_URL atau SUPABASE_ANON_KEY " +
      "belum diatur. Menulis js/config.js dengan nilai kosong. " +
      "Atur kedua environment variable ini di pengaturan project Vercel."
  );
}

const content = `// File ini dibuat OTOMATIS oleh scripts/generate-config.js saat build.
// JANGAN edit manual dan JANGAN commit file ini ke Git.
const SUPABASE_CONFIG = {
  url: "${supabaseUrl || ""}",
  anonKey: "${supabaseAnonKey || ""}"
};
`;

const outputPath = path.join(__dirname, "..", "js", "config.js");
fs.writeFileSync(outputPath, content, "utf8");

console.log("[generate-config] js/config.js berhasil dibuat.");
