import unittest
import requests

base_url = "http://localhost:5000"


class Users(unittest.TestCase):
    def test_register_200(self):
        resp = requests.post(
            base_url + "/register",
            json={
                "name": "Leanne Graham",
                "email": "leanne@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 200
        assert isinstance(resp.json()["token"], str)

    def test_register_409(self):
        leanne = {
            "name": "Ervin Howell",
            "email": "ervin@example.com",
            "password": "password"
        }
        requests.post(
            base_url + "/register",
            json=leanne
        )
        resp = requests.post(
            base_url + "/register",
            json=leanne
        )

        assert resp.status_code == 409

    def test_login_200(self):
        requests.post(
            base_url + "/register",
            json={
                "name": "Chelsey Dietrich",
                "email": "chelsey@example.com",
                "password": "password"
            }
        )
        resp = requests.post(
            base_url + "/login",
            json={
                "email": "chelsey@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 200
        assert isinstance(resp.json()["token"], str)

    def test_login_400(self):
        requests.post(
            base_url + "/register",
            json={
                "name": "Clementine Bauch",
                "email": "clementine@example.com",
                "password": "password"
            }
        )
        resp = requests.post(
            base_url + "/login",
            json={
                "email": "WRONG@example.com",
                "password": "password"
            }
        )

        assert resp.status_code == 400

    def test_login_400_2(self):
        requests.post(
            base_url + "/register",
            json={
                "name": "Patricia Lebsack",
                "email": "patricia@example.com",
                "password": "password"
            }
        )
        resp = requests.post(
            base_url + "/login",
            json={
                "email": "patricia@example.com",
                "password": "WRONG"
            }
        )

        assert resp.status_code == 400


class Todos(unittest.TestCase):
    def setUp(self):
        requests.post(
            base_url + "/register",
            json={
                "name": "Mrs. Dennis Schulist",
                "email": "dennis@example.com",
                "password": "password"
            }
        )
        requests.post(
            base_url + "/register",
            json={
                "name": "Elwyn.Skiles",
                "email": "elwyn@example.com",
                "password": "password"
            }
        )

    def get_token_1(self):
        resp = requests.post(
            base_url + "/login",
            json={
                "email": "dennis@example.com",
                "password": "password"
            }
        )
        return resp.json()["token"]

    def get_token_2(self):
        resp = requests.post(
            base_url + "/login",
            json={
                "email": "elwyn@example.com",
                "password": "password"
            }
        )
        return resp.json()["token"]

    def test_create_todo_201(self):
        resp = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 201
        assert resp.json() == {
            "id": resp.json()["id"],
            "title": "Buy groceries",
            "description": "Buy milk, eggs, and bread",
        }

    def test_create_todo_400(self):
        resp = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": 123,
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 400

    def test_create_todo_400_2(self):
        resp = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": 123
            }
        )

        assert resp.status_code == 400

    def test_create_todo_401(self):
        resp = requests.post(
            base_url + "/todos",
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )

        assert resp.status_code == 401
        assert resp.json() == {"message": "Unauthorized"}

    def test_update_todo_200(self):
        resp1 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )
        id = resp1.json()["id"]
        resp2 = requests.put(
            base_url + "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, bread, and cheese"
            }
        )

        assert resp2.status_code == 200
        assert resp2.json() == {
            "id": id,
            "title": "Buy groceries",
            "description": "Buy milk, eggs, bread, and cheese",
        }

    def test_update_todo_403(self):
        resp1 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )
        id = resp1.json()["id"]
        resp2 = requests.put(
            base_url + "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + self.get_token_2()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, bread, and cheese"
            }
        )

        assert resp2.status_code == 403
        assert resp2.json() == {"message": "Forbidden"}

    def test_delete_todo_204(self):
        resp1 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )
        id = resp1.json()["id"]
        resp2 = requests.delete(
            base_url + "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
        )

        assert resp2.status_code == 204

    def test_delete_todo_401(self):
        invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
        resp = requests.delete(
            base_url + "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + invalid_token
            },
        )

        assert resp.status_code == 401
        assert resp.json() == {"message": "Unauthorized"}

    def test_delete_todo_403(self):
        resp1 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, and bread"
            }
        )
        id = resp1.json()["id"]
        resp2 = requests.delete(
            base_url + "/todos/" + str(id),
            headers={
                "Authorization": "Bearer " + self.get_token_2()
            },
        )

        assert resp2.status_code == 403
        assert resp2.json() == {"message": "Forbidden"}

    def test_0_get_todos_200(self):
        resp1 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Buy groceries",
                "description": "Buy milk, eggs, bread"
            }
        )
        resp2 = requests.post(
            base_url + "/todos",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
            json={
                "title": "Pay bills",
                "description": "Pay electricity and water bills"
            }
        )
        resp3 = requests.get(
            base_url + "/todos?page=1&limit=10",
            headers={
                "Authorization": "Bearer " + self.get_token_1()
            },
        )

        assert resp3.status_code == 200
        assert resp3.json() == {
            "data": [
                {
                    "description": "Buy milk, eggs, bread",
                    "id": resp1.json()["id"],
                    "title": "Buy groceries",
                },
                {
                    "description": "Pay electricity and water bills",
                    "id": resp2.json()["id"],
                    "title": "Pay bills",
                }
            ],
            "page": 1,
            "limit": 10,
            "total": resp3.json()["total"]
        }
