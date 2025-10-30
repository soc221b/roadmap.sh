import unittest
from app import create_app
from app.db import init_db


class Users(unittest.TestCase):
    def test_register_200(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
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

    def test_register_409(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
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

    def test_login_200(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
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

    def test_login_400(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
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

    def test_login_400_2(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
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


class Todos(unittest.TestCase):

    def register_users(self, client):

        client.post(
            "/register",
            json={
                "name": "Mrs. Dennis Schulist",
                "email": "dennis@example.com",
                "password": "password"
            }
        )
        client.post(
            "/register",
            json={
                "name": "Elwyn.Skiles",
                "email": "elwyn@example.com",
                "password": "password"
            }
        )

    def get_token_1(self, client):
        resp = client.post(
            "/login",
            json={
                "email": "dennis@example.com",
                "password": "password"
            }
        )
        return resp.json["token"]

    def get_token_2(self, client):
        resp = client.post(
            "/login",
            json={
                "email": "elwyn@example.com",
                "password": "password"
            }
        )
        return resp.json["token"]

    def test_create_todo_201(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
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

    def test_create_todo_400(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": 123,
                        "description": "Buy milk, eggs, and bread"
                    }
                )

                assert resp.status_code == 400

    def test_create_todo_400_2(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": 123
                    }
                )

                assert resp.status_code == 400

    def test_create_todo_401(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp = client.post(
                    "/todos",
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, and bread"
                    }
                )

                assert resp.status_code == 401
                assert resp.json == {"message": "Unauthorized"}

    def test_update_todo_200(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp1 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, and bread"
                    }
                )
                id = resp1.json["id"]
                resp2 = client.put(
                    "/todos/" + str(id),
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, bread, and cheese"
                    }
                )

                assert resp2.status_code == 200
                assert resp2.json == {
                    "id": id,
                    "title": "Buy groceries",
                    "description": "Buy milk, eggs, bread, and cheese",
                }

    def test_update_todo_403(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp1 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, and bread"
                    }
                )
                id = resp1.json["id"]
                resp2 = client.put(
                    "/todos/" + str(id),
                    headers={
                        "Authorization": "Bearer " + self.get_token_2(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, bread, and cheese"
                    }
                )

                assert resp2.status_code == 403
                assert resp2.json == {"message": "Forbidden"}

    def test_delete_todo_204(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp1 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, and bread"
                    }
                )
                id = resp1.json["id"]
                resp2 = client.delete(
                    "/todos/" + str(id),
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                )

                assert resp2.status_code == 204

    def test_delete_todo_401(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
                resp = client.delete(
                    "/todos/" + str(id),
                    headers={
                        "Authorization": "Bearer " + invalid_token
                    },
                )

                assert resp.status_code == 401
                assert resp.json == {"message": "Unauthorized"}

    def test_delete_todo_403(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp1 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, and bread"
                    }
                )
                id = resp1.json["id"]
                resp2 = client.delete(
                    "/todos/" + str(id),
                    headers={
                        "Authorization": "Bearer " + self.get_token_2(client)
                    },
                )

                assert resp2.status_code == 403
                assert resp2.json == {"message": "Forbidden"}

    def test_get_todos_200(self):
        app = create_app({'DATABASE': 'file::memory:'})
        with app.test_client() as client:
            with app.app_context():
                init_db()
                self.register_users(client)
                resp1 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Buy groceries",
                        "description": "Buy milk, eggs, bread"
                    }
                )
                resp2 = client.post(
                    "/todos",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                    json={
                        "title": "Pay bills",
                        "description": "Pay electricity and water bills"
                    }
                )
                resp3 = client.get(
                    "/todos?page=1&limit=10",
                    headers={
                        "Authorization": "Bearer " + self.get_token_1(client)
                    },
                )

                assert resp3.status_code == 200
                assert resp3.json == {
                    "data": [
                        {
                            "description": "Buy milk, eggs, bread",
                            "id": resp1.json["id"],
                            "title": "Buy groceries",
                        },
                        {
                            "description": "Pay electricity and water bills",
                            "id": resp2.json["id"],
                            "title": "Pay bills",
                        }
                    ],
                    "page": 1,
                    "limit": 10,
                    "total": resp3.json["total"]
                }
