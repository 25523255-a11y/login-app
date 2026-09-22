// ============================================================================
// REGISTER - register.js
// Alur:
// 1. Validasi semua field (wajib diisi, email valid, password >= 6 karakter,
//    password & konfirmasi sama, username belum dipakai).
// 2. Buat akun di Supabase Auth (auth.signUp).
// 3. Simpan username & nama ke tabel "profiles".
// 4. Arahkan ke halaman login.
//
// CATATAN:
// - Password TIDAK disimpan di tabel profiles. Password sepenuhnya
//   dikelola oleh Supabase Authentication.
// ============================================================================

const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");
const alertBox = document.getElementById("alertBox");

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

function setFieldError(inputEl, errorEl, show, customMessage) {
  if (customMessage) {
    errorEl.textContent = customMessage;
  }
  errorEl.classList.toggle("show", show);
  inputEl.style.borderColor = show ? "#dc2626" : "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
  let valid = true;

  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  setFieldError(fullNameInput, document.getElementById("fullNameError"), !fullName, "Nama lengkap wajib diisi.");
  if (!fullName) valid = false;

  setFieldError(usernameInput, document.getElementById("usernameError"), !username, "Username wajib diisi.");
  if (!username) valid = false;

  const emailInvalid = !email || !isValidEmail(email);
  setFieldError(emailInput, document.getElementById("emailError"), emailInvalid, "Email tidak valid.");
  if (emailInvalid) valid = false;

  const passwordInvalid = !password || password.length < 6;
  setFieldError(passwordInput, document.getElementById("passwordError"), passwordInvalid, "Password minimal 6 karakter.");
  if (passwordInvalid) valid = false;

  const confirmInvalid = password !== confirmPassword || !confirmPassword;
  setFieldError(
    confirmPasswordInput,
    document.getElementById("confirmPasswordError"),
    confirmInvalid,
    "Konfirmasi password tidak sama."
  );
  if (confirmInvalid) valid = false;

  return valid;
}

async function isUsernameTaken(username) {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("username")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error(error);
    return false;
  }

  return !!data;
}

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlert();

  if (!validateForm()) {
    return;
  }

  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  try {
    // 1. Cek apakah username sudah dipakai
    const taken = await isUsernameTaken(username);
    if (taken) {
      setFieldError(usernameInput, document.getElementById("usernameError"), true, "Username sudah digunakan.");
      return;
    }

    // 2. Buat akun di Supabase Auth
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (signUpError) {
      showAlert("Pendaftaran gagal: " + signUpError.message, "error");
      return;
    }

    const userId = signUpData.user ? signUpData.user.id : null;

    if (!userId) {
      showAlert("Pendaftaran gagal, silakan coba lagi.", "error");
      return;
    }

    // 3. Simpan data ke tabel profiles
    const { error: profileError } = await supabaseClient.from("profiles").insert({
      id: userId,
      username: username,
      nama: fullName,
      email: email
    });

    if (profileError) {
      showAlert("Akun dibuat, tetapi gagal menyimpan profil: " + profileError.message, "error");
      return;
    }

    showAlert("Pendaftaran berhasil! Mengarahkan ke halaman login...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (err) {
    console.error(err);
    showAlert("Terjadi kesalahan. Silakan coba lagi.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Daftar";
  }
});
