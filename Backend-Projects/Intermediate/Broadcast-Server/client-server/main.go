package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// since we serve index.html on the same origin, no custom [websocket.CheckOrigin] is needed
	// https://pkg.go.dev/github.com/gorilla/websocket#Upgrader.CheckOrigin
}

type Hub struct {
	conns map[*websocket.Conn]struct{}
}

func main() {
	hub := Hub{conns: map[*websocket.Conn]struct{}{}}
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println(err)
			return
		}

		hub.conns[conn] = struct{}{}

		for {
			msgType, msg, err := conn.ReadMessage()

			if err != nil {
				if websocket.IsUnexpectedCloseError(err, 1000, 1001) {
					fmt.Println("IsUnexpectedCloseError", err)
				}
				delete(hub.conns, conn)
				return
			}

			for conn := range hub.conns {
				if err = conn.WriteMessage(msgType, msg); err != nil {
					fmt.Println("WriteMessage", err)
					delete(hub.conns, conn)
					continue
				}
			}
		}
	})

	http.HandleFunc("/index.js", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.js")
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Security-Policy", "default-src 'self'")
		http.ServeFile(w, r, "index.html")
	})

	http.ListenAndServe(":8080", nil)
}
