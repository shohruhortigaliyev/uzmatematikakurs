/* Login app using window.api (Supabase) for auth */
function getInput(id) {
  return document.getElementById(id).value.trim();
}

function switchTab(name) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelector(`[onclick="switchTab('${name}')"]`)
    .classList.add("active");
  document.getElementById("content-" + name).classList.add("active");
  clearErrors();
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  btn.innerHTML = isHidden ? "👁️" : "👁️";
}

function clearErrors() {
  document.getElementById("userError").textContent = "";
  document.getElementById("adminError").textContent = "";
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = "⚠ " + msg;
  const card = document.querySelector(".login-card");
  if (card) {
    card.classList.remove("shake");
    void card.offsetHeight;
    card.classList.add("shake");
  }
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  el.style.color = "#2e7d32";
  el.textContent = msg;
}

function loginUser() {
  const login = getInput("userLogin");
  const pass = getInput("userPass");
  if (!login) return showError("userError", "Loginni kiriting!");
  if (!pass) return showError("userError", "Parolni kiriting!");
  if (!window.api || !window.api.loginUser) {
    return showError(
      "userError",
      "Tizim bilan bog'lanib bo'lmadi. Iltimos qaytadan urining.",
    );
  }
  window.api
    .loginUser(login, pass)
    .then((res) => {
      if (res && res.ok && res.user) {
        const u = res.user;
        localStorage.setItem(
          "current_user",
          JSON.stringify({
            id: u.id,
            fullname: u.fullname || u.name || u.code,
            login: u.login || u.code,
            status: u.status || "",
          }),
        );
        showSuccess("userError", "✅ Muvaffaqiyatli kirildi!");
        setTimeout(() => (window.location.href = "bosh-sahifa.html"), 600);
      } else {
        showError("userError", "Login yoki parol noto‘g‘ri!");
      }
    })
    .catch((err) => {
      console.error(err);
      showError("userError", "Tizim bilan bog'lanishda xatolik yuz berdi");
    });
}

function loginAdmin() {
  const login = getInput("adminLogin");
  const pass = getInput("adminPass");
  if (!login) return showError("adminError", "Loginni kiriting!");
  if (!pass) return showError("adminError", "Parolni kiriting!");
  if (!window.api || !window.api.adminLogin) {
    return showError(
      "adminError",
      "Tizim bilan bog'lanib bo'lmadi. Iltimos qaytadan urining.",
    );
  }
  window.api
    .adminLogin(login, pass)
    .then((res) => {
      if (res && res.ok) {
        localStorage.setItem("admin_logged_in", "true");
        if (res.admin_key) localStorage.setItem("admin_key", res.admin_key);
        showSuccess("adminError", "✅ Admin paneliga kirildi!");
        setTimeout(() => (window.location.href = "admin.html"), 600);
      } else {
        showError("adminError", "Login yoki parol noto'g'ri!");
      }
    })
    .catch((err) => {
      console.error(err);
      showError("adminError", "Tizim bilan bog'lanishda xatolik yuz berdi");
    });
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (document.getElementById("content-user").classList.contains("active")) {
    loginUser();
  }
  if (document.getElementById("content-admin").classList.contains("active")) {
    loginAdmin();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  switchTab("user");
  document.getElementById("userLogin").focus();
});
