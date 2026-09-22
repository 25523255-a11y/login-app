// ============================================================================
// SUPABASE CLIENT
// File ini membuat satu koneksi Supabase yang dipakai bersama oleh
// semua halaman (login, register, dashboard, reset-password).
//
// PENTING:
// - SUPABASE_CONFIG diambil dari file js/config.js (TIDAK di-commit ke Git).
// - Hanya gunakan "anon/public key" di sini. JANGAN PERNAH menaruh
//   service_role key di file frontend mana pun.
// ============================================================================

if (typeof SUPABASE_CONFIG === "undefined") {
  console.error(
    "SUPABASE_CONFIG tidak ditemukan. Pastikan Anda sudah membuat file js/config.js " +
      "(salin dari js/config.example.js) dan file tersebut dimuat sebelum js/supabase.js."
  );
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);
