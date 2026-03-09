from datetime import timedelta

from flask import Flask, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.secret_key = "replace-this-with-a-random-secret"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=31)

# The backend stores only a server-side hash of the client-side SHA-256 password hash.
USER_RECORD = {
    "username": "administer",
    "password_hash": generate_password_hash(
        "8d969eef6ecad3c29a3a629280e686cff8fabf4d7f6dbf3f8f6beedccf5b0f4e"
    ),
}


@app.get("/")
def root():
    return redirect(url_for("login_page"))


@app.get("/login")
def login_page():
    if session.get("logged_in"):
        return redirect(url_for("editor_page"))
    return app.send_static_file("frontend/login.html")


@app.post("/api/login")
def login_api():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "").strip()
    client_password_hash = payload.get("password_hash", "")
    keep_logged_in = bool(payload.get("keep_logged_in", False))

    if username != USER_RECORD["username"]:
        return jsonify({"ok": False, "message": "用户名或密码错误。"}), 401

    if not check_password_hash(USER_RECORD["password_hash"], client_password_hash):
        return jsonify({"ok": False, "message": "用户名或密码错误。"}), 401

    session.clear()
    session["logged_in"] = True
    session["username"] = username
    session.permanent = keep_logged_in

    return jsonify({"ok": True, "redirect": url_for("editor_page")})


@app.get("/editor")
def editor_page():
    if not session.get("logged_in"):
        return redirect(url_for("login_page"))
    return render_template("editor.html", username=session.get("username"))


@app.post("/api/logout")
def logout_api():
    session.clear()
    return jsonify({"ok": True, "redirect": url_for("login_page")})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
