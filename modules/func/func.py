from flask import Blueprint, redirect, render_template, session, url_for


func_bp = Blueprint(
    "func",
    __name__,
    template_folder="func_templates",
    static_folder="func_static",
    static_url_path="/func_static",
)


@func_bp.route("/dashboard")
def dashboard():
    user = session.get("user")
    if not user:
        return redirect(url_for("auth.login"))

    return render_template("dashboard.html", user=user)
