import unittest
import random
import string
import functools
from app import create_app
from app.db import init_db


def init_app(test):
    @functools.wraps(test)
    def wrapped_view(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                test(self, client)

    return wrapped_view


class Users(unittest.TestCase):
    @init_app
    def test_register_200(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "email": "leanne@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 200
        assert isinstance(resp.json["token"], str)

    @init_app
    def test_register_400_missing_name(self, client):
        resp = client.post(
            "/register",
            json={
                "email": "leanne@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_missing_email(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_missing_password(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "email": "leanne@example.com",
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_wrong_name_type(self, client):
        resp = client.post(
            "/register",
            json={
                "name": 123,
                "email": "leanne@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_wrong_email_type(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "email": 123,
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_wrong_email_format(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "email": "leanne@example.com",
                "password": 123,
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_400_wrong_email_format(self, client):
        resp = client.post(
            "/register",
            json={
                "name": "Leanne Graham",
                "email": "leanne",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_register_409(self, client):
        leanne = {
            "name": "Ervin Howell",
            "email": "ervin@example.com",
            "password": "password"
        }
        client.post(
            "/register",
            json=leanne
        )
        resp = client.post(
            "/register",
            json=leanne
        )

        assert resp.status_code == 409

    @init_app
    def test_login_200(self, client):
        client.post(
            "/register",
            json={
                "name": "Chelsey Dietrich",
                "email": "chelsey@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "email": "chelsey@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 200
        assert isinstance(resp.json["token"], str)

    @init_app
    def test_login_400_missing_email(self, client):
        client.post(
            "/register",
            json={
                "name": "Clementine Bauch",
                "email": "clementine@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_login_400_missing_password(self, client):
        client.post(
            "/register",
            json={
                "name": "Patricia Lebsack",
                "email": "patricia@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "email": "patricia@example.com",
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_login_400_wrong_email(self, client):
        client.post(
            "/register",
            json={
                "name": "Clementine Bauch",
                "email": "clementine@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "email": "WRONG@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_login_400_wrong_password(self, client):
        client.post(
            "/register",
            json={
                "name": "Patricia Lebsack",
                "email": "patricia@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "email": "patricia@example.com",
                "password": "WRONG"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_login_400_wrong_email_format(self, client):
        client.post(
            "/register",
            json={
                "name": "Clementine Bauch",
                "email": "clementine@example.com",
                "password": "password"
            }
        )
        resp = client.post(
            "/login",
            json={
                "email": "patricia",
                "password": "password"
            }
        )

        assert resp.status_code == 400


class Todos(unittest.TestCase):

    @init_app
    def test_create_todo_201(self, client):
        token = create_user_and_get_token(client)

        resp = client.post(
            "/todos",
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 201
        assert resp.json == {
            "id": resp.json["id"],
            "title": "Buy groceries",
            "description": "Buy milk, eggs, and bread",
        }

    @init_app
    def test_create_todo_400_missing_title(self, client):
        token = create_user_and_get_token(client)

        resp = client.post(
            "/todos",
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_create_todo_400_missing_description(self, client):
        token = create_user_and_get_token(client)

        resp = client.post(
            "/todos",
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "title": "Buy groceries",
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_create_todo_400_wrong_title_type(self, client):
        token = create_user_and_get_token(client)

        resp = client.post(
            "/todos",
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "title": 123,
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_create_todo_400_wrong_description_type(self, client):
        token = create_user_and_get_token(client)

        resp = client.post(
            "/todos",
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "title": "Buy groceries",
                "description": 123
            }
        )

        assert resp.status_code == 400

    @init_app
    def test_create_todo_401(self, client):
        resp = client.post(
            "/todos",
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 401
        assert resp.json == {"message": "Unauthorized"}

    @init_app
    def test_update_todo_200(self, client):
        token = create_user_and_get_token(client)
        id = create_todo_and_get_id(client, token)

        resp = client.put(
            "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + token
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, bread, and cheese"
            }
        )

        assert resp.status_code == 200
        assert resp.json == {
            "id": id,
            "title": "Buy groceries",
            "description": "Buy milk, eggs, bread, and cheese",
        }

    @init_app
    def test_update_todo_403(self, client):
        user1_token = create_user_and_get_token(client)
        user2_token = create_user_and_get_token(client)
        id = create_todo_and_get_id(client, user1_token)

        resp = client.put(
            "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + user2_token
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, bread, and cheese"
            }
        )

        assert resp.status_code == 403
        assert resp.json == {"message": "Forbidden"}

    @init_app
    def test_delete_todo_204(self, client):
        token = create_user_and_get_token(client)
        id = create_todo_and_get_id(client, token)

        resp = client.delete(
            "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + token
            },
        )

        assert resp.status_code == 204

    @init_app
    def test_delete_todo_401(self, client):
        invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
        resp = client.delete(
            "/todos/" + str(1),
            headers={
                "Authorization": "Bearer " + invalid_token
            },
        )

        assert resp.status_code == 401
        assert resp.json == {"message": "Unauthorized"}

    @init_app
    def test_delete_todo_403(self, client):
        user1_token = create_user_and_get_token(client)
        user2_token = create_user_and_get_token(client)
        id = create_todo_and_get_id(client, user1_token)

        resp = client.delete(
            "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + user2_token
            },
        )

        assert resp.status_code == 403
        assert resp.json == {"message": "Forbidden"}

    @init_app
    def test_get_todos_200(self, client):
        token = create_user_and_get_token(client)
        id1 = create_todo_and_get_id(client, token, json={
                                     "title": "Buy groceries", "description": "Buy milk, eggs, bread"})
        id2 = create_todo_and_get_id(client, token, json={
                                     "title": "Pay bills", "description": "Pay electricity and water bills"})

        resp3 = client.get(
            "/todos?page=1&limit=10",
            headers={
                "Authorization": "Bearer " + token
            },
        )

        assert resp3.status_code == 200
        assert resp3.json == {
            "data": [
                {
                    "id": id1,
                    "title": "Buy groceries",
                    "description": "Buy milk, eggs, bread",
                },
                {
                    "id": id2,
                    "title": "Pay bills",
                    "description": "Pay electricity and water bills",
                }
            ],
            "page": 1,
            "limit": 10,
            "total": resp3.json["total"]
        }


def create_user_and_get_token(client):
    random_string = ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=10))
    resp = client.post(
        "/register",
        json={
            "name": random_string,
            "email": random_string + "@example.com",
            "password": random_string
        }
    )
    return resp.json["token"]


def create_todo_and_get_id(client, token, json=None):
    if json is None:
        random_string = ''.join(random.choices(
            string.ascii_uppercase + string.digits, k=10))
        json = {
            "title": random_string,
            "description": random_string
        }
    resp = client.post(
        "/todos",
        headers={
            "Authorization": "Bearer " + token
        },
        json=json
    )
    return resp.json["id"]
