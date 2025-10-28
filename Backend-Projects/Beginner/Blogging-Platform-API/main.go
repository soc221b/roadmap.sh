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
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	DB, err := sql.Open("mysql", os.Getenv("DATA_SOURCE_NAME"))
	if err != nil {
		panic(err)
	}
	defer DB.Close()
	SL.Load(DB)

	retryTimes := 0
	for {
		err = DB.Ping()
		if err == nil {
			break
		} else if retryTimes < 10 {
			time.Sleep(5 * time.Second)
			retryTimes++
		} else {
			panic(err)
		}
	}

	RegisterHandlers()

	fmt.Println("Server listening on Port 8080")
	http.ListenAndServe(":8080", nil)
}

func RegisterHandlers() {
	http.HandleFunc("POST /posts", PostHandler)
	http.HandleFunc("PUT /posts/{id}", PutHandler)
	http.HandleFunc("DELETE /posts/{id}", DeleteHandler)
	http.HandleFunc("GET /posts/{id}", GetHandler)
	http.HandleFunc("GET /posts", GetAllHandler)
}

type Post struct {
	Id       int      `json:"id"`
	Title    string   `json:"title"`
	Content  string   `json:"content"`
	Category string   `json:"category"`
	Tags     []string `json:"tags"`
}

func PostHandler(w http.ResponseWriter, r *http.Request) {
	post := Post{}
	json.NewDecoder(r.Body).Decode(&post)
	result, err := SL.DB.Exec(`INSERT INTO posts (title, content, category, tags) VALUES (?, ?, ?, ?)`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "))
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

func PutHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
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
	result, err := SL.DB.Exec(`UPDATE posts SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?`, post.Title, post.Content, post.Category, strings.Join(post.Tags, " "), id)
	if numberOfRows, err := result.RowsAffected(); err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else if numberOfRows == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func DeleteHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
	if err != nil {
		if errors.Is(err, strconv.ErrSyntax) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}

	result, err := SL.DB.Exec(`DELETE FROM posts WHERE id = ?`, id)
	if numberOfRows, err := result.RowsAffected(); err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	} else if numberOfRows == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	if err != nil {
		fmt.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func GetHandler(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))
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
	row := SL.DB.QueryRow("SELECT id, title, content, category, tags FROM posts WHERE id = ?", id)
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

func GetAllHandler(w http.ResponseWriter, r *http.Request) {
	term := "%" + r.URL.Query().Get("term") + "%"

	rows, err := SL.DB.Query("SELECT id, title, content, category, tags FROM posts WHERE title LIKE ? OR category LIKE ? OR tags LIKE ?", term, term, term)
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
