# README

## Getting Started

```sh
$ npm ci
```

## Run Locally

```sh
$ node main.ts --port 3000 --origin https://dummyjson.com
```

```sh
$ curl http://localhost:3000/users/1 -v # response header X-Cache: MISS
$ curl http://localhost:3000/users/1 -v # response header X-Cache: HIT
```

```sh
$ node main.ts --clear-cache
```
