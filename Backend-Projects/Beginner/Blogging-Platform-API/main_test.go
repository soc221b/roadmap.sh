package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/mux"
)

type Test struct {
	title             string
	sqlMock           func(DBMock sqlmock.Sqlmock)
	getHandler        func(c *C) func(http.ResponseWriter, *http.Request)
	setVar            func(r *http.Request) *http.Request
	method            string
	url               string
	body              any
	expectStatus      int
	expectContentType string
	expectBody        string
}

func TestApp(t *testing.T) {
	var tests = []Test{
		{
			title: "CreateBlogPost201",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec("INSERT INTO posts").WithArgs("My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming").WillReturnResult(sqlmock.NewResult(1, 1))
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.PostHandler
			},
			method: "POST",
			url:    "/posts",
			body: struct {
				Title    string   `json:"title"`
				Content  string   `json:"content"`
				Category string   `json:"category"`
				Tags     []string `json:"tags"`
			}{
				Title:    "My First Blog Post",
				Content:  "This is the content of my first blog post.",
				Category: "Technology",
				Tags:     []string{"Tech", "Programming"},
			},
			expectStatus:      201,
			expectContentType: "application/json",
			expectBody:        `{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"]}`,
		},

		{
			title: "UpdateBlogPost200",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec("UPDATE posts SET title = \\?, content = \\?, category = \\?, tags = \\? WHERE id = \\?").
					WithArgs("My Updated Blog Post", "This is the updated content of my first blog post.", "Tech", "Programming Tech", 1).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.PutHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method: "PUT",
			url:    "/posts/1",
			body: struct {
				Title    string   `json:"title"`
				Content  string   `json:"content"`
				Category string   `json:"category"`
				Tags     []string `json:"tags"`
			}{
				Title:    "My Updated Blog Post",
				Content:  "This is the updated content of my first blog post.",
				Category: "Tech",
				Tags:     []string{"Programming", "Tech"},
			},
			expectStatus: 200,
		},

		{
			title: "UpdateBlogPost400",
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.PutHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "abc"})
			},
			method: "PUT",
			url:    "/posts/1",
			body: struct {
				Title    string   `json:"title"`
				Content  string   `json:"content"`
				Category string   `json:"category"`
				Tags     []string `json:"tags"`
			}{
				Title:    "My Updated Blog Post",
				Content:  "This is the updated content of my first blog post.",
				Category: "Tech",
				Tags:     []string{"Programming", "Tech"},
			},
			expectStatus: 400,
		},

		{
			title: "UpdateBlogPost404",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec("UPDATE posts SET title = \\?, content = \\?, category = \\?, tags = \\? WHERE id = \\?").
					WithArgs("My Updated Blog Post", "This is the updated content of my first blog post.", "Tech", "Programming Tech", 1).
					WillReturnError(sql.ErrNoRows)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.PutHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method: "PUT",
			url:    "/posts/1",
			body: struct {
				Title    string   `json:"title"`
				Content  string   `json:"content"`
				Category string   `json:"category"`
				Tags     []string `json:"tags"`
			}{
				Title:    "My Updated Blog Post",
				Content:  "This is the updated content of my first blog post.",
				Category: "Tech",
				Tags:     []string{"Programming", "Tech"},
			},
			expectStatus: 404,
		},

		{
			title: "DeleteBlogPost204",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec("DELETE FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.DeleteHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method:       "DELETE",
			url:          "/posts/1",
			expectStatus: 204,
		},

		{
			title: "DeleteBlogPost400",
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.DeleteHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "abc"})
			},
			method:       "DELETE",
			url:          "/posts/1",
			expectStatus: 400,
		},

		{
			title: "DeleteBlogPost404",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectExec("DELETE FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnError(sql.ErrNoRows)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.DeleteHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method:       "DELETE",
			url:          "/posts/1",
			expectStatus: 404,
		},

		{
			title: "GetBlogPost200",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT id, title, content, category, tags FROM posts WHERE id =").
					WithArgs(1).WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags"}).
						AddRow(1, "My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming"),
				)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.GetHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method:            "GET",
			url:               "/posts/1",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        `{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"]}`,
		},

		{
			title: "GetBlogPost400",
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.GetHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "abc"})
			},
			method:       "GET",
			url:          "/posts/1",
			expectStatus: 400,
		},

		{
			title: "GetBlogPost404",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT id, title, content, category, tags FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnError(sql.ErrNoRows)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.GetHandler
			},
			setVar: func(r *http.Request) *http.Request {
				return mux.SetURLVars(r, map[string]string{"id": "1"})
			},
			method:       "GET",
			url:          "/posts/1",
			expectStatus: 404,
		},

		{
			title: "GetAllBlogPosts200",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT id, title, content, category, tags FROM posts WHERE title LIKE \\? OR category LIKE \\? OR tags LIKE \\?").
					WithArgs("%%", "%%", "%%").WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags"}).
						AddRow(1, "My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming").
						AddRow(2, "My Second Blog Post", "This is the content of my second blog post.", "Technology", "Tech Programming"),
				)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.GetAllHandler
			},
			method:            "GET",
			url:               "/posts",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        `[{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"]},{"id":2,"title":"My Second Blog Post","content":"This is the content of my second blog post.","category":"Technology","tags":["Tech","Programming"]}]`,
		},

		{
			title: "GetAllBlogPosts200 filter by term",
			sqlMock: func(mock sqlmock.Sqlmock) {
				mock.ExpectQuery("SELECT id, title, content, category, tags FROM posts WHERE title LIKE \\? OR category LIKE \\? OR tags LIKE \\?").
					WithArgs("%Second%", "%Second%", "%Second%").WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags"}).
						AddRow(2, "My Second Blog Post", "This is the content of my second blog post.", "Technology", "Tech Programming"),
				)
			},
			getHandler: func(c *C) func(http.ResponseWriter, *http.Request) {
				return c.GetAllHandler
			},
			method:            "GET",
			url:               "/posts?term=Second",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        `[{"id":2,"title":"My Second Blog Post","content":"This is the content of my second blog post.","category":"Technology","tags":["Tech","Programming"]}]`,
		},
	}

	for _, test := range tests {
		t.Run(test.title, func(t *testing.T) {
			run(t, test)
		})
	}
}

func run(t *testing.T, test Test) {
	// arrange
	DB, DBMock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer DB.Close()
	c := &C{DB: DB}
	if test.sqlMock != nil {
		test.sqlMock(DBMock)
	}

	// act
	out, err := json.Marshal(test.body)
	if err != nil {
		panic(err)
	}
	req, err := http.NewRequest(test.method, test.url, bytes.NewBuffer(out))
	if err != nil {
		t.Fatal(err)
	}
	if test.setVar != nil {
		req = test.setVar(req)
	}
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(test.getHandler(c))
	handler.ServeHTTP(rr, req)

	// assert
	if actualStatus := rr.Code; actualStatus != test.expectStatus {
		t.Errorf("handler returned wrong status code: got %v want %v", actualStatus, test.expectStatus)
	}
	if actualContentType := rr.Header().Get("Content-Type"); actualContentType != test.expectContentType {
		t.Errorf("handler returned wrong content type: got %v want %v", actualContentType, test.expectContentType)
	}
	if actualBody := strings.Trim(rr.Body.String(), "\n"); actualBody != test.expectBody {
		t.Errorf("handler returned unexpected body: got %v want %v", actualBody, test.expectBody)
	}
	if err := DBMock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
