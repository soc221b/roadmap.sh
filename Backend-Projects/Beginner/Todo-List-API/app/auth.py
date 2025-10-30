import os
import time
import functools
import jwt
from flask import request, abort, Blueprint, g
from app.db import get_db
from werkzeug.security import check_password_hash, generate_password_hash


bp = Blueprint('auth', __name__)


@bp.post("/register")
def register():
    body = request.get_json()
    name = body['name']
    email = body['email']
    password = body['password']

    if not name:
        abort(400)
    if not email:
        abort(400)
    if not password:
        abort(400)

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password)),
        )
        db.commit()
    except db.IntegrityError:
        abort(409)
    else:
        return {"token": create_access_token(cursor.lastrowid)}, 200


@bp.post("/login")
def login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    db = get_db()
    user = db.execute(
        'SELECT * FROM user WHERE email = ?', (email,)
    ).fetchone()

    if user is None:
        return "Invalid email or password", 400
    if not check_password_hash(user['password'], password):
        return "Invalid email or password", 400

    return {"token": create_access_token(user['id'])}


def create_access_token(user_id):
    return jwt.encode(
        {
            "exp": int(time.time()) + 10 * 60,
            'user_id': user_id,
        },
        os.environ['SECRET'],
        algorithm='HS256'
    )


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return {"message": "Unauthorized"}, 401

        return view(**kwargs)

    return wrapped_view


@bp.before_app_request
def load_logged_in_user():
    try:
        authorization = request.headers.get('Authorization')
        token = authorization.split(' ')[1]
        decoded = jwt.decode(
            token, os.environ['SECRET'], algorithms=['HS256'])
        db = get_db()
        g.user = db.execute(
            'SELECT * FROM user WHERE id = ?', (decoded['user_id'],)
        ).fetchone()
    except:
        g.user = None
