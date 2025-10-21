# README

## Getting Started

```sh
$ npm ci
```

## Run Locally

```sh
$ node main.ts --port 3001 --origin https://dummyjson.com
```

## Try it

```sh
$ curl http://localhost:3001/users/1 -v # response header X-Cache: MISS
$ curl http://localhost:3001/users/1 -v # response header X-Cache: HIT
```
