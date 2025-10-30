# README

## Getting Started

```sh
$ echo -n "SECRET=" > .env
$ python3 -c 'import secrets; print(secrets.token_hex())' >> .env
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
$ rm tasks.db
$ python3 -m flask run
```

```sh
$ python3 -m unittest test.py
```
