# README

## Getting Started

```sh
$ npm ci
```

## Environment Variables

```sh
$ echo "ACCESS_TOKEN_SECRET=SHHHH" >> .env
$ echo "REFRESH_TOKEN_SECRET=SHHHHHHHHH" >> .env
```

## Run Locally

```sh
$ node --env-file .env main.ts
```

## Architectures

### Sequence Diagrams

#### Login/logout

```mermaid
sequenceDiagram
    Client->>Server: Login with correct email and password
    note right of Server: POST /login
    Server->>Client: 200, set RefershToken and AccessToken to cookie
    loop refresh
    Client->>Server: Refresh AccessToken
    note right of Server: POST /refresh
    Server->>Client: 200, set AccessToken to cookie
    end

    Client->>Server: Logout
    Server->>Client: 200, remove RefershToken and AccessToken from cookie
    note right of Server: POST /logout
```

### Class Diagramss

#### Dependency Inversion of Data Source

```mermaid
classDiagram
    ArticleRepository <|-- FileSystemArticleRepository
    ArticleRepository <|-- InMemoryArticleRepository
    ArticleRepository <|-- ORMArticleRepository
    ArticleRepository: +getAll()
    ArticleRepository: +get()
    ArticleRepository: +post()
    ArticleRepository: +put()
    ArticleRepository: +delete()
```
