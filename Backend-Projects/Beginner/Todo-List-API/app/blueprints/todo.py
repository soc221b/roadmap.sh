import bleach
from flask import request, abort, Blueprint
from app.shared import get_current_user
from app.models.todo import Todo


bp = Blueprint('todos', __name__, url_prefix='/todos')


@bp.route("", methods=['POST'])
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


@bp.route("/<int:id>", methods=['PUT'])
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


@bp.route("/<int:id>", methods=['DELETE'])
def delete_todo(id):
    try:
        todo = Todo.select().where(Todo.id == id).get()
    except:
        None

    if todo.user_id != get_current_user().id:
        return {"message": "Forbidden"}, 403

    todo.delete_instance()
    return "", 204


@bp.route("/<int:id>", methods=['GET'])
def get_todo(id):
    return Todo.select().where(Todo.id == id).get()


@bp.route("", methods=['GET'])
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
