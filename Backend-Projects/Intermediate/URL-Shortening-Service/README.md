# URL Shortening Service

https://roadmap.sh/projects/url-shortening-service

## Getting Started

```sh
$ git clone https://github.com/soc221b/roadmap.sh.git
$ cd roadmap.sh/Backend-Projects/Intermediate/URL-Shortening-Service
$ npm ci
```

Install MongoDB: https://www.mongodb.com/docs/manual/administration/install-community/

## Setup

```sh
$ brew services start mongodb-community@8.2
```

## Run Locally

```sh
$ node main.ts
```

```sh
$ curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"url":"https://google.com"}' \
  http://localhost:3003/shorten
$ # ...
```

## Teardown

```sh
$ brew services stop mongodb-community@8.2
```
