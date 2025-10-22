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
