from dotenv import load_dotenv
from flask import Flask, request
from app.models.todo import todos_db, Todo
from app.models.user import users_db, User
from app.blueprints.todo import bp as todo_bp
from app.blueprints.user import bp as user_bp
from app.shared import get_current_user

load_dotenv()

todos_db.connect()
todos_db.create_tables([Todo])

users_db.connect()
users_db.create_tables([User])

app = Flask(__name__)

app.register_blueprint(todo_bp)
app.register_blueprint(user_bp)


@app.before_request
def hook():
    print(request.path)
    if request.path == '/register':
        return
    if request.path == '/login':
        return

    try:
        get_current_user()
    except:
        return {"message": "Unauthorized"}, 401
