// ============================================================================
// LOGIN - login.js
// Alur:
// 1. Validasi input.
// 2. Jika input mengandung "@" -> anggap email, langsung dipakai.
//    Jika tidak -> anggap username, cari email-nya di tabel "profiles".
// 3. Login ke Supabase Auth pakai email + password.
// 4. Ambil data profile, arahkan ke dashboard.
// ============================================================================

const loginForm = document.getElementById("loginForm");
const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");
const rememberMeInput = document.getElementById("rememberMe");
const submitBtn = document.getElementById("submitBtn");
const alertBox = document.getElementById("alertBox");

// Isi ulang username/email yang diingat (fitur "Ingat saya")
window.addEventListener("DOMContentLoaded", () => {
  const savedIdentifier = localStorage.getItem("rememberedIdentifier");
  if (savedIdentifier) {
    identifierInput.value = savedIdentifier;
    rememberMeInput.checked = true;
  }
});

// Toggle lihat/sembunyikan password
document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "Sembunyikan";
    } else {
      input.type = "password";
      btn.textContent = "Lihat";
    }
  });
});

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = "alert show " + (type === "error" ? "alert-error" : "alert-success");
}

function hideAlert() {
  alertBox.className = "alert";
}

function showFieldError(inputEl, errorEl, show) {
  errorEl.classList.toggle("show", show);
  inputEl.style.borderColor = show ? "#dc2626" : "";
}

function validateForm() {
  let valid = true;

  const identifier = identifierInput.value.trim();
  const password = passwordInput.value;

  if (!identifier) {
    showFieldError(identifierInput, document.getElementById("identifierError"), true);
    valid = false;
  } else {
    showFieldError(identifierInput, document.getElementById("identifierError"), false);
  }

  if (!password) {
    showFieldError(passwordInput, document.getElementById("passwordError"), true);
    valid = false;
  } else {
    showFieldError(passwordInput, document.getElementById("passwordError"), false);
  }

  return valid;
}

async function resolveEmail(identifier) {
  // Jika mengandung "@" anggap sudah email
  if (identifier.includes("@")) {
    return identifier;
  }

  // Jika bukan email, cari di tabel profiles berdasarkan username
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("email")
    .eq("username", identifier)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.email;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();

  if (!validateForm()) {
    return;
  }

  const identifier = identifierInput.value.trim();
  const password = passwordInput.value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  try {
    const email = await resolveEmail(identifier);

    if (!email) {
      showAlert("Username atau email tidak ditemukan.", "error");
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      showAlert("Login gagal: Email/username atau password salah.", "error");
      return;
    }

    // Simpan / hapus "Ingat saya"
    if (rememberMeInput.checked) {
      localStorage.setItem("rememberedIdentifier", identifier);
    } else {
      localStorage.removeItem("rememberedIdentifier");
    }

    showAlert("Login berhasil! Mengarahkan ke dashboard...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (err) {
    console.error(err);
    showAlert("Terjadi kesalahan. Silakan coba lagi.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk";
  }
});
