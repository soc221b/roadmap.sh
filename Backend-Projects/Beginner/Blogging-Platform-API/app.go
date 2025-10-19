package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gorilla/mux"
)

type Post struct {
	Id       string   `json:"id"`
	Title    string   `json:"title"`
	Content  string   `json:"content"`
	Category string   `json:"category"`
	Tags     []string `json:"tags"`
}

func main() {
	db, err := sql.Open("mysql", os.Getenv("DATABASE_URL"))
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	err = db.Ping()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	// const query = `
	// CREATE TABLE posts (
	// 		id INT AUTO_INCREMENT,
	// 		title TEXT NOT NULL,
	// 		content TEXT NOT NULL,
	// 		category TEXT NOT NULL,
	// 		tags TEXT NOT NULL,
	// 		PRIMARY KEY (id)
	// );`
	// _, err = db.Exec(query)
	// if err != nil {
	// 	fmt.Println(err)
	// 	os.Exit(1)
	// }

	r := mux.NewRouter()

	rp := r.PathPrefix("/posts").Subrouter()

	rp.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		post := Post{}
		json.NewDecoder(r.Body).Decode(&post)
		result, err := db.Exec(`INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "))
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		id, err := result.LastInsertId()
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		created := struct {
			Id int64 `json:"id"`
		}{
			Id: id,
		}
		w.WriteHeader(http.StatusCreated)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(created)
	}).Methods("POST")

	rp.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		post := Post{}
		json.NewDecoder(r.Body).Decode(&post)
		_, err := db.Exec(`UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "), mux.Vars(r)["id"])
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
	}).Methods("PUT")

	rp.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		_, err := db.Exec(`DELETE FROM posts WHERE id = ?`, mux.Vars(r)["id"])
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}).Methods("DELETE")

	rp.HandleFunc("/{id}", func(w http.ResponseWriter, r *http.Request) {
		post := Post{}
		tags := ""
		row := db.QueryRow("SELECT id, title, content, category, tags FROM posts WHERE id = ?", mux.Vars(r)["id"])
		if err := row.Scan(&post.Id, &post.Title, &post.Content, &post.Category, &tags); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				w.WriteHeader(404)
			} else {
				fmt.Println(err)
				w.WriteHeader(http.StatusBadRequest)
			}
			return
		}
		post.Tags = strings.Split(tags, " ")

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)
	}).Methods("GET")

	rp.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		term := "%" + r.URL.Query().Get("term") + "%"

		rows, err := db.Query("SELECT id, title, content, category, tags FROM posts WHERE title LIKE ? OR category LIKE ? OR tags LIKE ?", term, term, term)
		if err != nil {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer rows.Close()

		posts := []Post{}
		for rows.Next() {
			post := Post{}
			tags := ""
			err := rows.Scan(&post.Id, &post.Title, &post.Content, &post.Category, &tags)
			if err != nil {
				fmt.Println(err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			post.Tags = strings.Split(tags, " ")
			posts = append(posts, post)
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	}).Methods("GET")

	http.ListenAndServe(":8080", r)
}
