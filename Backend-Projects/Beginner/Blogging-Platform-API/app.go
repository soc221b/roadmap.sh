package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	_ "github.com/go-sql-driver/mysql"

	"github.com/gorilla/mux"
)

type C struct {
	DB *sql.DB
}

func main() {
	db, err := sql.Open("mysql", os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		panic(err)
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

	c := &C{DB: db}

	router := mux.NewRouter()

	routerPosts := router.PathPrefix("/posts").Subrouter()
	routerPosts.HandleFunc("", c.PostHandler).Methods("POST")
	routerPosts.HandleFunc("/{id}", c.PutHandler).Methods("PUT")
	routerPosts.HandleFunc("/{id}", c.DeleteHandler).Methods("DELETE")
	routerPosts.HandleFunc("/{id}", c.GetHandler).Methods("GET")
	routerPosts.HandleFunc("", c.GetAllHandler).Methods("GET")

	http.ListenAndServe(":8080", router)
}

type Post struct {
	Id       int      `json:"id"`
	Title    string   `json:"title"`
	Content  string   `json:"content"`
	Category string   `json:"category"`
	Tags     []string `json:"tags"`
}

func (c *C) PostHandler(w http.ResponseWriter, r *http.Request) {
	post := Post{}
	json.NewDecoder(r.Body).Decode(&post)
	result, err := c.DB.Exec(`INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "))
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
		Id       int64    `json:"id"`
		Title    string   `json:"title"`
		Content  string   `json:"content"`
		Category string   `json:"category"`
		Tags     []string `json:"tags"`
	}{
		Id:       id,
		Title:    post.Title,
		Content:  post.Content,
		Category: post.Category,
		Tags:     post.Tags,
	}
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(created)
}

func (c *C) PutHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		if errors.Is(err, strconv.ErrSyntax) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	post := Post{}
	json.NewDecoder(r.Body).Decode(&post)
	_, err = c.DB.Exec(`UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (c *C) DeleteHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		if errors.Is(err, strconv.ErrSyntax) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	_, err = c.DB.Exec(`DELETE FROM posts WHERE id = ?`, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (c *C) GetHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		if errors.Is(err, strconv.ErrSyntax) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	post := Post{}
	tags := ""
	row := c.DB.QueryRow("SELECT id, title, content, category, tags FROM posts WHERE id = ?", id)
	if err := row.Scan(&post.Id, &post.Title, &post.Content, &post.Category, &tags); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusBadRequest)
		}
		return
	}
	post.Tags = strings.Split(tags, " ")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
}

func (c *C) GetAllHandler(w http.ResponseWriter, r *http.Request) {
	term := "%" + r.URL.Query().Get("term") + "%"

	rows, err := c.DB.Query("SELECT id, title, content, category, tags FROM posts WHERE title LIKE ? OR category LIKE ? OR tags LIKE ?", term, term, term)
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
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
}
