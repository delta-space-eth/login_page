from flask import Blueprint, redirect, render_template, request, session, url_for


auth_bp = Blueprint(
    "auth",
    __name__,
    template_folder="auth_templates",
    static_folder="auth_static",
    static_url_path="/auth_static",
)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        if username and password:
            session["user"] = username
            return redirect(url_for("func.dashboard"))

        return render_template(
            "login.html",
            error="请输入用户名和密码。",
        )

    return render_template("login.html")


@auth_bp.route("/logout")
def logout():
    session.pop("user", None)
    return redirect(url_for("auth.login"))
