const form = document.getElementById("login-form");
const message = document.getElementById("message");
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const rememberPassword = document.getElementById("remember-password");
const keepLoggedIn = document.getElementById("keep-logged-in");

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function restoreRemembered() {
  const remembered = localStorage.getItem("remembered_login");
  if (!remembered) return;
  const parsed = JSON.parse(remembered);
  usernameInput.value = parsed.username || "";
  passwordInput.value = "";
  passwordInput.dataset.rememberedHash = parsed.passwordHash || "";
  rememberPassword.checked = true;
}

restoreRemembered();

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "隐藏" : "显示";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";

  const username = usernameInput.value.trim();
  const plainPassword = passwordInput.value;

  let passwordHash = "";
  if (plainPassword) {
    passwordHash = await sha256(plainPassword);
  } else if (passwordInput.dataset.rememberedHash) {
    passwordHash = passwordInput.dataset.rememberedHash;
  }

  if (!username || !passwordHash) {
    message.textContent = "请输入用户名和密码。";
    return;
  }

  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password_hash: passwordHash,
      keep_logged_in: keepLoggedIn.checked,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    message.textContent = data.message || "登录失败。";
    return;
  }

  if (rememberPassword.checked) {
    localStorage.setItem(
      "remembered_login",
      JSON.stringify({ username, passwordHash })
    );
  } else {
    localStorage.removeItem("remembered_login");
  }

  window.location.href = data.redirect;
});
