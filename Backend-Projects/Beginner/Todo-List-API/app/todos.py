from flask import request, abort, Blueprint, g
from app.auth import login_required
from app.db import get_db
from pydantic import BaseModel, ValidationError

bp = Blueprint('todos', __name__)


class PostTodoRequest(BaseModel):
    title: str
    description: str


@bp.post("/todos")
@login_required
def post_todo():
    try:
        data = PostTodoRequest(**request.json)
    except ValidationError as e:
        abort(400)

    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO todo (title, description, user_id) VALUES (?, ?, ?)",
            (data.title, data.description, g.user['id']),
        )
        db.commit()
        return {'id': cursor.lastrowid, 'title': data.title, 'description': data.description}, 201
    except:
        abort(500)


class PutTodoRequest(BaseModel):
    title: str
    description: str


@bp.put("/todos/<int:id>")
@login_required
def put_todo(id):
    try:
        data = PutTodoRequest(**request.json)
    except ValidationError as e:
        abort(400)

    db = get_db()
    todo = db.execute(
        'SELECT user_id FROM todo WHERE id = ?',
        (id,)
    ).fetchone()

    if todo is None:
        abort(404)

    if todo['user_id'] != g.user['id']:
        return {"message": "Forbidden"}, 403

    try:
        db.execute(
            "UPDATE todo SET title = ?, description = ? WHERE id = ?",
            (data.title, data.description, id),
        )
        db.commit()
        return {'id': id, 'title': data.title, 'description': data.description}, 200
    except:
        abort(500)


@bp.delete("/todos/<int:id>")
@login_required
def delete_todo(id):
    db = get_db()
    todo = db.execute(
        'SELECT user_id FROM todo WHERE id = ?',
        (id,)
    ).fetchone()

    if todo['user_id'] != g.user['id']:
        return {"message": "Forbidden"}, 403

    try:
        db.execute(
            "DELETE FROM todo WHERE id = ?",
            (id,)
        )
        db.commit()
        return '', 204
    except:
        abort(500)


@bp.get("/todos/<int:id>")
@login_required
def get_todo(id):
    db = get_db()
    return db.execute(
        'SELECT user_id FROM todo WHERE id = ?',
        (id,)
    ).fetchone()


@bp.get("/todos")
@login_required
def get_todos():
    try:
        page = request.args.get('page', type=int)
        limit = request.args.get('limit', type=int)
    except:
        abort(400)
    offset = (page - 1) * limit

    db = get_db()
    return {
        'data': [{'id': todo['id'], 'title': todo['title'], 'description': todo['description']} for todo in db.execute('SELECT id, title, description FROM todo LIMIT ? OFFSET ?', (limit, offset))],
        'page': page,
        'limit': limit,
        'total': db.execute('SELECT COUNT(*) FROM todo').fetchone()[0]
    }
