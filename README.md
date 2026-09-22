# Login App — Vanilla HTML, CSS, JavaScript + Supabase

Aplikasi login sederhana dengan fitur:
- Login menggunakan **Username atau Email**
- Register akun baru
- Dashboard setelah login
- Lupa Password / Reset Password
- Autentikasi & database menggunakan **Supabase**

Tidak menggunakan framework (React/Vue/Next.js) — murni HTML, CSS, dan JavaScript agar mudah dipelajari.

---

## 1. Struktur Project

```
login-app/
│
├── index.html              # Halaman login
├── register.html            # Halaman daftar
├── dashboard.html            # Halaman dashboard (butuh login)
├── reset-password.html       # Lupa password & buat password baru
│
├── css/
│   └── style.css              # Style global
│
├── js/
│   ├── config.example.js       # Contoh konfigurasi Supabase (aman di-commit)
│   ├── config.js                # Konfigurasi asli (JANGAN di-commit, digenerate)
│   ├── supabase.js               # Inisialisasi Supabase client
│   ├── login.js                   # Logika halaman login
│   ├── register.js                 # Logika halaman register
│   ├── dashboard.js                 # Logika halaman dashboard
│   └── reset-password.js             # Logika lupa/reset password
│
├── scripts/
│   └── generate-config.js       # Script build: membuat js/config.js dari env var (untuk Vercel)
│
├── supabase/
│   └── schema.sql              # SQL untuk membuat tabel profiles + RLS policy
│
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

---

## 2. Cara Membuat Project Supabase

1. Buka https://supabase.com dan login/daftar.
2. Klik **New Project**.
3. Isi nama project, password database, dan pilih region terdekat.
4. Tunggu beberapa menit sampai project selesai dibuat.
5. Di sidebar, buka **Project Settings > API**. Catat dua nilai ini:
   - **Project URL** (contoh: `https://xxxxxxx.supabase.co`)
   - **anon public key** (JANGAN gunakan `service_role` key)

---

## 3. Cara Membuat Tabel `profiles`

1. Di dashboard Supabase, buka menu **SQL Editor**.
2. Buka file `supabase/schema.sql` di project ini, salin seluruh isinya.
3. Tempel ke SQL Editor, lalu klik **Run**.

Script ini akan:
- Membuat tabel `profiles` (id, username, nama, email, created_at).
- Mengaktifkan **Row Level Security (RLS)**.
- Membuat policy agar:
  - Data profil bisa dibaca publik (dibutuhkan untuk fitur login dengan username).
  - User hanya bisa membuat/mengubah profil miliknya sendiri.

> Kolom `id` di tabel `profiles` terhubung langsung ke `auth.users.id` milik Supabase Authentication. Password **tidak pernah** disimpan di tabel ini — password sepenuhnya dikelola oleh Supabase Auth.

---

## 4. Cara Mengatur Authentication

1. Di dashboard Supabase, buka **Authentication > Providers**.
2. Pastikan **Email** provider aktif (biasanya sudah aktif secara default).
3. Buka **Authentication > URL Configuration**:
   - **Site URL**: isi dengan URL project Anda nanti (untuk lokal bisa `http://localhost:5500` atau `http://127.0.0.1:5500`, untuk production isi URL Vercel Anda).
   - **Redirect URLs**: tambahkan URL halaman `reset-password.html` Anda, contoh:
     - `http://127.0.0.1:5500/reset-password.html`
     - `https://nama-project-anda.vercel.app/reset-password.html`
4. (Opsional) Jika ingin mempermudah saat development, Anda bisa menonaktifkan sementara "Confirm email" di **Authentication > Providers > Email** agar akun langsung aktif tanpa konfirmasi email. Untuk production, sebaiknya biarkan aktif demi keamanan.

---

## 5. Cara Memasukkan Environment Variable (Supabase URL & Anon Key)

**API key TIDAK ditulis langsung (hardcode) di source code.** Caranya:

### Untuk development di komputer lokal
1. Salin file `js/config.example.js` menjadi `js/config.js` (di folder yang sama).
2. Buka `js/config.js`, isi dengan URL dan Anon Key Supabase Anda:
   ```js
   const SUPABASE_CONFIG = {
     url: "https://xxxxxxx.supabase.co",
     anonKey: "isi-anon-key-anda"
   };
   ```
3. File `js/config.js` **sudah otomatis diabaikan oleh Git** (lihat `.gitignore`), jadi aman dan tidak akan ter-upload ke GitHub.

### Untuk deployment di Vercel
Alih-alih menulis manual, Vercel akan **membuat file `js/config.js` secara otomatis** saat proses build, menggunakan environment variable yang Anda atur di dashboard Vercel:
1. Saat setup project di Vercel, buka **Settings > Environment Variables**.
2. Tambahkan dua variable:
   - `SUPABASE_URL` = URL project Supabase Anda
   - `SUPABASE_ANON_KEY` = anon public key Supabase Anda
3. Vercel akan menjalankan `npm run build`, yang menjalankan `scripts/generate-config.js` untuk membuat `js/config.js` secara otomatis dari kedua environment variable tersebut. Anda tidak perlu menulis key ini di kode.

> Catatan: Anon/public key Supabase memang dirancang aman untuk dipakai di sisi frontend (dibatasi oleh Row Level Security), tetapi kita tetap menghindari hardcode agar mudah diganti antar environment (development, staging, production) tanpa mengubah kode.

---

## 6. Cara Menjalankan Project di VS Code (Lokal)

1. Buka folder `login-app` di VS Code.
2. Pastikan sudah membuat `js/config.js` sesuai langkah di bagian 5.
3. Install extension **Live Server** (oleh Ritwick Dey) di VS Code.
4. Klik kanan pada `index.html` → pilih **Open with Live Server**.
5. Browser akan terbuka otomatis, misalnya di `http://127.0.0.1:5500/index.html`.
6. Coba daftar akun baru di halaman Register, lalu login.

> Alternatif tanpa extension: jalankan `npx serve .` di terminal VS Code (butuh Node.js terinstall), lalu buka URL yang muncul di terminal.

---

## 7. Alur Aplikasi (Ringkasan)

**Register → Supabase Auth → Profile → Login → Dashboard → Logout**
1. User mengisi form register.
2. Akun dibuat di Supabase Auth (`auth.signUp`).
3. Data (username, nama, email) disimpan ke tabel `profiles`.
4. User diarahkan ke halaman login.
5. User login dengan username/email + password.
6. Jika input username, sistem mencari email terkait di tabel `profiles`, lalu login dengan email tersebut.
7. Setelah login berhasil, user diarahkan ke dashboard.
8. Dashboard menampilkan nama, username, email dari tabel `profiles`.
9. Logout menghapus session dan mengarahkan kembali ke login.

**Lupa Password → Email Reset → Password Baru**
1. User memasukkan email di halaman "Lupa Password?".
2. Supabase mengirim email berisi link reset.
3. User klik link tersebut, diarahkan kembali ke `reset-password.html` dengan token khusus di URL.
4. Halaman otomatis mendeteksi token ini dan menampilkan form "Buat Password Baru".
5. Setelah disimpan, user diarahkan kembali ke halaman login.

---

## 8. Cara Upload ke GitHub

Jalankan perintah berikut di terminal (dari dalam folder `login-app`):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [GITHUB_REPOSITORY]
git push -u origin main
```

Ganti `[GITHUB_REPOSITORY]` dengan URL repository GitHub Anda sendiri, contoh:
`https://github.com/username-anda/login-app.git`

> Karena `js/config.js` ada di `.gitignore`, file berisi Anon Key Anda **tidak akan ter-upload** ke GitHub. Yang ter-upload hanya `js/config.example.js` sebagai contoh.

---

## 9. Cara Deploy ke Vercel

1. Buka https://vercel.com dan login (bisa pakai akun GitHub).
2. Klik **Add New... > Project**.
3. Pilih repository GitHub `login-app` yang tadi sudah di-push.
4. Pada bagian **Environment Variables**, tambahkan:
   - `SUPABASE_URL` = URL project Supabase Anda
   - `SUPABASE_ANON_KEY` = anon public key Supabase Anda
5. Framework Preset biarkan **Other** (project ini statis, tanpa framework).
6. Klik **Deploy**. Vercel akan menjalankan `npm run build` (yang membuat `js/config.js` otomatis) lalu mempublikasikan project.
7. Setelah selesai, Anda akan mendapat URL seperti `https://login-app-anda.vercel.app`.
8. Terakhir, kembali ke Supabase **Authentication > URL Configuration**, tambahkan URL Vercel Anda ke **Site URL** dan **Redirect URLs** (contoh: `https://login-app-anda.vercel.app/reset-password.html`) agar fitur reset password berfungsi di production.

---

## 10. Keamanan yang Sudah Diterapkan

- Password **tidak pernah** disimpan di tabel `profiles` — sepenuhnya dikelola Supabase Auth.
- Hanya **anon/public key** yang dipakai di frontend, **tidak pernah** `service_role` key.
- Anon Key tidak di-hardcode di source code; dibuat lewat file `js/config.js` yang di-gitignore, dan digenerate otomatis dari environment variable saat deploy ke Vercel.
- Row Level Security (RLS) aktif di tabel `profiles`.
- Dashboard memvalidasi session Supabase sebelum menampilkan data; jika belum login, otomatis diarahkan ke halaman login.

---

Selamat belajar dan semoga project ini membantu memahami alur autentikasi dengan Supabase! 🚀
s