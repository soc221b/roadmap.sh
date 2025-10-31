import os
import time
import functools
import jwt
from flask import request, abort, Blueprint, g
from app.db import get_db
from werkzeug.security import check_password_hash, generate_password_hash
from pydantic import BaseModel, EmailStr, ValidationError


bp = Blueprint('auth', __name__)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@bp.post("/register")
def register():
    try:
        data = RegisterRequest(**request.json)
    except ValidationError as e:
        abort(400)

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO user (name, email, password) VALUES (?, ?, ?)",
            (data.name, data.email, generate_password_hash(data.password)),
        )
        db.commit()
    except db.IntegrityError:
        abort(409)
    else:
        return {"token": create_access_token(cursor.lastrowid)}, 200


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@bp.post("/login")
def login():
    try:
        data = LoginRequest(**request.json)
    except ValidationError as e:
        abort(400)

    db = get_db()
    user = db.execute(
        'SELECT * FROM user WHERE email = ?', (data.email,)
    ).fetchone()

    if user is None:
        return "Invalid email or password", 400
    if not check_password_hash(user['password'], data.password):
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
