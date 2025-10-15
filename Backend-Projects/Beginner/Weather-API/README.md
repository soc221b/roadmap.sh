# Weather API

https://roadmap.sh/projects/weather-api-wrapper-service

## Getting Started

```sh
$ git clone https://github.com/soc221b/roadmap.sh.git
$ cd roadmap.sh/Backend-Projects/Beginner/Weather-API
$ npm ci
```

## Environment Variables

```sh
$ touch .env
$ echo "VISUAL_CROSSING_WEB_SERVICES_KEY=YOUR_API_KEY" >> .env
```

## Run Locally

```sh
$ docker run -p 6379:6379 -d redis:8.0-rc1
$ node --env-file .env main.ts
```

## Tests

```sh
$ npx vitest run
```
