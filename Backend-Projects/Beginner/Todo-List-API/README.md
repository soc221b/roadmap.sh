# README

## Getting Started

```sh
$ echo "SECRET=SHHHHHHHHH" >> .env
$ virtualenv .venv
$ source .venv/bin/activate
$ pip3 install -r requirements.txt
```

## Run Locally

```sh
$ python3 -m flask run
```

## Tests

```sh
$ rm users.db
$ rm todos.db
$ python3 -m flask run
```

```sh
$ python3 -m unittest
```
