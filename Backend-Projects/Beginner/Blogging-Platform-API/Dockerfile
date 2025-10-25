FROM golang:1.25.3-alpine3.22

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

COPY app.go ./
RUN go build -o a.out

CMD ["/usr/src/app/a.out"]
