import os
import jwt
from flask import request
from app.models.user import User
from app.constant import algorithm


def get_current_user():
    authorization = request.headers.get('Authorization')
    token = authorization.split(' ')[1]
    decoded = jwt.decode(token, os.environ['SECRET'], algorithms=[algorithm])
    return User.get(User.id == decoded['user_id'])
