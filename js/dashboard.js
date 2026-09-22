// ============================================================================
// DASHBOARD - dashboard.js
// Alur:
// 1. Cek session Supabase. Jika tidak ada -> redirect ke login.
// 2. Ambil data profile dari tabel "profiles" berdasarkan user id.
// 3. Tampilkan nama, username, email.
// 4. Logout -> hapus session -> redirect ke login.
// ============================================================================

const welcomeText = document.getElementById("welcomeText");
const profileNama = document.getElementById("profileNama");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const logoutBtn = document.getElementById("logoutBtn");
const alertBox = document.getElementById("alertBox");

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = "alert show " + (type === "error" ? "alert-error" : "alert-success");
}

async function loadDashboard() {
  // 1. Validasi session
  const {
    data: { session },
    error: sessionError
  } = await supabaseClient.auth.getSession();

  if (sessionError || !session) {
    window.location.href = "index.html";
    return;
  }

  const userId = session.user.id;

  // 2. Ambil data profile
  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("nama, username, email")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    showAlert("Gagal memuat data profil.", "error");
    return;
  }

  // 3. Tampilkan data
  welcomeText.textContent = "Selamat Datang, " + profile.nama;
  profileNama.textContent = profile.nama;
  profileUsername.textContent = profile.username;
  profileEmail.textContent = profile.email;
}

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  logoutBtn.textContent = "Memproses...";

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    showAlert("Gagal logout, silakan coba lagi.", "error");
    logoutBtn.disabled = false;
    logoutBtn.textContent = "Logout";
    return;
  }

  window.location.href = "index.html";
});

loadDashboard();
