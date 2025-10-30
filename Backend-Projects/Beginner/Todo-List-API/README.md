# README

## Getting Started

```sh
$ echo -n "SECRET=" > .env
$ python3 -c 'import secrets; print(secrets.token_hex())' >> .env
$ python3 -m venv .venv
$ source .venv/bin/activate
$ pip3 install -r requirements.txt
```

## Run Locally

```sh
$ python3 -m flask run
```

## Tests

```sh
$ python3 -m unittest test.py
```
