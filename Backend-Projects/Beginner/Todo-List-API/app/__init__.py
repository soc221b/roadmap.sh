from dotenv import load_dotenv
from flask import Flask


def create_app(test_config=None):
    load_dotenv()

    app = Flask(__name__)

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)
    from . import todos
    app.register_blueprint(todos.bp)

    return app
