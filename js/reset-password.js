// ============================================================================
// RESET PASSWORD - reset-password.js
//
// Halaman ini punya 2 mode:
//
// MODE 1 - Minta Reset (default):
//   User memasukkan email -> Supabase mengirim email berisi link reset.
//
// MODE 2 - Buat Password Baru:
//   Saat user klik link di email, Supabase mengarahkan kembali ke halaman
//   ini dengan token recovery di URL. Mode ini otomatis terdeteksi dan
//   form "Buat Password Baru" akan ditampilkan.
// ============================================================================

const requestSection = document.getElementById("requestSection");
const updateSection = document.getElementById("updateSection");

const requestForm = document.getElementById("requestForm");
const emailInput = document.getElementById("email");
const requestBtn = document.getElementById("requestBtn");
const alertBox = document.getElementById("alertBox");

const updateForm = document.getElementById("updateForm");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
const updateBtn = document.getElementById("updateBtn");
const alertBoxUpdate = document.getElementById("alertBoxUpdate");

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

function showAlert(box, message, type) {
  box.textContent = message;
  box.className = "alert show " + (type === "error" ? "alert-error" : "alert-success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Deteksi apakah URL mengandung token recovery dari Supabase
function isRecoveryLink() {
  const hash = window.location.hash;
  return hash.includes("type=recovery");
}

if (isRecoveryLink()) {
  requestSection.style.display = "none";
  updateSection.style.display = "block";
}

// ---------------- MODE 1: Kirim link reset ----------------
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const emailError = document.getElementById("emailError");

  if (!email || !isValidEmail(email)) {
    emailError.classList.add("show");
    emailInput.style.borderColor = "#dc2626";
    return;
  }
  emailError.classList.remove("show");
  emailInput.style.borderColor = "";

  requestBtn.disabled = true;
  requestBtn.textContent = "Mengirim...";

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
      showAlert(alertBox, "Gagal mengirim email reset: " + error.message, "error");
      return;
    }

    showAlert(alertBox, "Email reset password telah dikirim. Silakan periksa inbox Anda.", "success");
    requestForm.reset();
  } catch (err) {
    console.error(err);
    showAlert(alertBox, "Terjadi kesalahan. Silakan coba lagi.", "error");
  } finally {
    requestBtn.disabled = false;
    requestBtn.textContent = "Kirim Link Reset";
  }
});

// ---------------- MODE 2: Simpan password baru ----------------
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = newPasswordInput.value;
  const confirmNewPassword = confirmNewPasswordInput.value;

  const newPasswordError = document.getElementById("newPasswordError");
  const confirmNewPasswordError = document.getElementById("confirmNewPasswordError");

  let valid = true;

  if (!newPassword || newPassword.length < 6) {
    newPasswordError.classList.add("show");
    newPasswordInput.style.borderColor = "#dc2626";
    valid = false;
  } else {
    newPasswordError.classList.remove("show");
    newPasswordInput.style.borderColor = "";
  }

  if (newPassword !== confirmNewPassword || !confirmNewPassword) {
    confirmNewPasswordError.classList.add("show");
    confirmNewPasswordInput.style.borderColor = "#dc2626";
    valid = false;
  } else {
    confirmNewPasswordError.classList.remove("show");
    confirmNewPasswordInput.style.borderColor = "";
  }

  if (!valid) return;

  updateBtn.disabled = true;
  updateBtn.textContent = "Menyimpan...";

  try {
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
      showAlert(alertBoxUpdate, "Gagal menyimpan password baru: " + error.message, "error");
      return;
    }

    showAlert(alertBoxUpdate, "Password berhasil diubah! Mengarahkan ke halaman login...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
  } catch (err) {
    console.error(err);
    showAlert(alertBoxUpdate, "Terjadi kesalahan. Silakan coba lagi.", "error");
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = "Simpan Password Baru";
  }
});
