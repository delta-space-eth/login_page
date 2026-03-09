const form = document.getElementById("login-form");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberPasswordInput = document.getElementById("rememberPassword");
const keepLoggedInInput = document.getElementById("keepLoggedIn");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

function showMessage(text, type) {
  message.className = type;
  message.textContent = text;
}

function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.textContent = loading ? "正在安全验证..." : "立即登录";
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function restoreRememberedLogin() {
  const raw = localStorage.getItem("remembered_login");
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    usernameInput.value = parsed.username || "";
    passwordInput.dataset.rememberedHash = parsed.passwordHash || "";
    rememberPasswordInput.checked = true;
  } catch {
    localStorage.removeItem("remembered_login");
  }
}

restoreRememberedLogin();

togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeIcon.classList.toggle("fa-eye", !isPassword);
  eyeIcon.classList.toggle("fa-eye-slash", isPassword);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("", "");

  const username = usernameInput.value.trim();
  const plainPassword = passwordInput.value;

  let passwordHash = "";
  if (plainPassword) {
    passwordHash = await sha256(plainPassword);
  } else if (passwordInput.dataset.rememberedHash) {
    passwordHash = passwordInput.dataset.rememberedHash;
  }

  if (!username || !passwordHash) {
    showMessage("请输入账号和密码", "error");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password_hash: passwordHash,
        keep_logged_in: keepLoggedInInput.checked,
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
      showMessage(result.message || "登录失败", "error");
      return;
    }

    if (rememberPasswordInput.checked) {
      localStorage.setItem(
        "remembered_login",
        JSON.stringify({ username, passwordHash })
      );
    } else {
      localStorage.removeItem("remembered_login");
    }

    showMessage("登录成功，正在进入系统...", "success");
    setTimeout(() => {
      window.location.href = result.redirect;
    }, 500);
  } catch {
    showMessage("网络异常，请稍后再试", "error");
  } finally {
    setLoading(false);
  }
});
