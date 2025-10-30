import sqlite3
from flask import current_app, g


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            'file::memory:',
            uri=True
        )
        g.db.row_factory = sqlite3.Row
        with current_app.open_resource('schema.sql') as f:
            g.db.executescript(f.read().decode('utf8'))

    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
