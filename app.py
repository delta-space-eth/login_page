from flask import Flask, redirect, url_for

from modules.auth.auth import auth_bp
from modules.func.func import func_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = "replace-with-a-secure-secret"

    app.register_blueprint(auth_bp)
    app.register_blueprint(func_bp)

    @app.route("/")
    def index():
        return redirect(url_for("auth.login"))

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
