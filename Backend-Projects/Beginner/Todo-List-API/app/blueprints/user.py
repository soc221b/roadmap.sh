import os
import time
import jwt
import bcrypt
import bleach
from flask import request, abort, Blueprint
from app.models.user import User
from app.constant import algorithm

algorithm = "HS256"

bp = Blueprint('auth', __name__)


@bp.route("/register", methods=['POST'])
def register():
    body = request.get_json()
    name = bleach.clean(body['name'])
    email = bleach.clean(body['email'])
    password = bleach.clean(body['password'])
    body = None

    try:
        user = User.select().where(User.email == email).get()
    except:
        None
    else:
        return abort(409)

    user = User.create(
        name=name,
        email=email,
        password=bcrypt.hashpw(
            password,
            bcrypt.gensalt()
        )
    )
    return {"token": create_access_token(user)}


@bp.route("/login", methods=['POST'])
def login():
    body = request.get_json()
    email = bleach.clean(body['email'])
    password = bleach.clean(body['password'])
    body = None

    try:
        user = User.select().where(User.email == email).get()
    except:
        return "Invalid email or password", 400

    if bcrypt.checkpw(password, user.password) == False:
        return "Invalid email or password", 400

    return {"token": create_access_token(user)}


def create_access_token(user):
    return jwt.encode(
        {
            "exp": int(time.time()) + 10 * 60,
            'user_id': user.id,
        },
        os.environ['SECRET'],
        algorithm=algorithm
    )
