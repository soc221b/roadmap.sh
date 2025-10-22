import os
import time
import jwt
import bcrypt
import bleach
from dotenv import load_dotenv
from flask import Flask, request, abort
from peewee import *

load_dotenv()
algorithm = "HS256"

app = Flask(__name__)
users_db = SqliteDatabase('users.db')
todos_db = SqliteDatabase('tasks.db')


class User(Model):
    name = CharField()
    email = CharField()
    password = CharField()

    class Meta:
        database = users_db


class Todo(Model):
    title = CharField()
    description = CharField()
    user = ForeignKeyField(User)

    class Meta:
        database = todos_db


users_db.connect()
users_db.create_tables([User])
todos_db.connect()
todos_db.create_tables([Todo])


@app.route("/register", methods=['POST'])
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


@app.route("/login", methods=['POST'])
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


@app.before_request
def hook():
    if request.path == '/register':
        return
    if request.path == '/login':
        return

    try:
        get_current_user()
    except:
        return {"message": "Unauthorized"}, 401


def get_current_user():
    authorization = request.headers.get('Authorization')
    token = authorization.split(' ')[1]
    decoded = jwt.decode(token, os.environ['SECRET'], algorithms=[algorithm])
    return User.get(User.id == decoded['user_id'])


@app.route("/todos", methods=['POST'])
def post_todo():
    body = request.get_json()
    if isinstance(body['title'], str) == False:
        return abort(400)
    title = bleach.clean(body['title'])
    if isinstance(body['description'], str) == False:
        return abort(400)
    description = bleach.clean(body['description'])
    body = None

    todo = Todo.create(title=title,
                       description=description,
                       user=get_current_user())
    return {'id': todo.id, 'title': title, 'description': description}, 201


@app.route("/todos/<int:id>", methods=['PUT'])
def put_todo(id):
    body = request.get_json()
    title = bleach.clean(body['title'])
    description = bleach.clean(body['description'])
    body = None

    try:
        todo = Todo.select().where(Todo.id == id).get()
    except:
        return "", 404

    if todo.user_id != get_current_user().id:
        return {"message": "Forbidden"}, 403

    try:
        todo.title = title
        todo.description = description
        todo.save()
        return {'id': todo.id, 'title': todo.title, 'description': todo.description}, 200
    except:
        return "", 404


@app.route("/todos/<int:id>", methods=['DELETE'])
def delete_todo(id):
    try:
        todo = Todo.select().where(Todo.id == id).get()
    except:
        None

    if todo.user_id != get_current_user().id:
        return {"message": "Forbidden"}, 403

    todo.delete_instance()
    return "", 204


@app.route("/todos/<int:id>", methods=['GET'])
def get_todo(id):
    return Todo.select().where(Todo.id == id).get()


@app.route("/todos", methods=['GET'])
def get_todos():
    page = int(bleach.clean(request.args.get('page')))
    limit = int(bleach.clean(request.args.get('limit')))
    offset = (page - 1) * limit
    return {
        'data': [{'id': x.id, 'title': x.title, 'description': x.description} for x in Todo.select().offset(offset).limit(limit)],
        'page': page,
        'limit': limit,
        'total': Todo.select().count()
    }
