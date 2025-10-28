package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

type Test struct {
	title             string
	expectSql         func(DBMock sqlmock.Sqlmock)
	method            string
	url               string
	body              any
	expectStatus      int
	expectContentType string
	expectBody        string
}

func TestFormatTime(t *testing.T) {
	var tests = []struct {
		argument string
		expected string
	}{
		{argument: "2014-11-12 11:45:26", expected: "2014-11-12T11:45:26Z"},
	}

	for _, test := range tests {
		if actual := FormatTime(test.argument); actual != test.expected {
			t.Errorf("handler returned wrong status code: got %v want %v", actual, test.expected)
		}
	}
}

func TestApp(t *testing.T) {
	var tests = []Test{
		{
			title:  "CreateBlogPost201",
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
			expectBody:        fmt.Sprintf(`{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"],"created_at":"%s","updated_at":"%s"}`, "2021-09-01T12:00:00Z", "2021-09-01T12:00:00Z"),
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectExec("INSERT INTO posts").WithArgs("My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming").WillReturnResult(sqlmock.NewResult(1, 1))
				DBMock.ExpectQuery("SELECT created_at, updated_at FROM posts WHERE id =").
					WithArgs(1).WillReturnRows(
					sqlmock.NewRows([]string{"created_at", "updated_at"}).
						AddRow("2021-09-01 12:00:00", "2021-09-01 12:00:00"),
				)
			},
		},

		{
			title:  "UpdateBlogPost200",
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
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        fmt.Sprintf(`{"id":1,"title":"My Updated Blog Post","content":"This is the updated content of my first blog post.","category":"Tech","tags":["Programming","Tech"],"created_at":"%s","updated_at":"%s"}`, "2021-09-01T12:00:00Z", "2021-09-01T12:30:00Z"),
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectExec("UPDATE posts SET title = \\?, content = \\?, category = \\?, tags = \\? WHERE id = \\?").
					WithArgs("My Updated Blog Post", "This is the updated content of my first blog post.", "Tech", "Programming Tech", 1).
					WillReturnResult(sqlmock.NewResult(0, 1))
				DBMock.ExpectQuery("SELECT id, created_at, updated_at FROM posts WHERE id =").
					WithArgs(1).WillReturnRows(
					sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).
						AddRow(1, "2021-09-01 12:00:00", "2021-09-01 12:30:00"),
				)
			},
		},

		{
			title:  "UpdateBlogPost400",
			method: "PUT",
			url:    "/posts/abc",
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
			title:  "UpdateBlogPost404",
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
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectExec("UPDATE posts SET title = \\?, content = \\?, category = \\?, tags = \\? WHERE id = \\?").
					WithArgs("My Updated Blog Post", "This is the updated content of my first blog post.", "Tech", "Programming Tech", 1).
					WillReturnResult(sqlmock.NewResult(0, 0))
			},
		},

		{
			title:        "DeleteBlogPost204",
			method:       "DELETE",
			url:          "/posts/1",
			expectStatus: 204,
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectExec("DELETE FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
		},

		{
			title:        "DeleteBlogPost400",
			method:       "DELETE",
			url:          "/posts/abc",
			expectStatus: 400,
		},

		{
			title:        "DeleteBlogPost404",
			method:       "DELETE",
			url:          "/posts/1",
			expectStatus: 404,
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectExec("DELETE FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(0, 0))
			},
		},

		{
			title:             "GetBlogPost200",
			method:            "GET",
			url:               "/posts/1",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        fmt.Sprintf(`{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"],"created_at":"%s","updated_at":"%s"}`, "2021-09-01T12:00:00Z", "2021-09-01T12:30:00Z"),
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectQuery("SELECT id, title, content, category, tags, created_at, updated_at FROM posts WHERE id =").
					WithArgs(1).WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags", "created_at", "updated_at"}).
						AddRow(1, "My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming", "2021-09-01 12:00:00", "2021-09-01 12:30:00"),
				)
			},
		},

		{
			title:        "GetBlogPost400",
			method:       "GET",
			url:          "/posts/abc",
			expectStatus: 400,
		},

		{
			title:        "GetBlogPost404",
			method:       "GET",
			url:          "/posts/1",
			expectStatus: 404,
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectQuery("SELECT id, title, content, category, tags, created_at, updated_at FROM posts WHERE id = ?").
					WithArgs(1).
					WillReturnError(sql.ErrNoRows)
			},
		},

		{
			title:             "GetAllBlogPosts200",
			method:            "GET",
			url:               "/posts",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        fmt.Sprintf(`[{"id":1,"title":"My First Blog Post","content":"This is the content of my first blog post.","category":"Technology","tags":["Tech","Programming"],"created_at":"%s","updated_at":"%s"},{"id":2,"title":"My Second Blog Post","content":"This is the content of my second blog post.","category":"Technology","tags":["Tech","Programming"],"created_at":"%s","updated_at":"%s"}]`, "2021-09-01T12:00:00Z", "2021-09-01T12:00:00Z", "2021-09-01T12:00:00Z", "2021-09-01T12:30:00Z"),
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectQuery("SELECT id, title, content, category, tags, created_at, updated_at FROM posts WHERE title LIKE \\? OR category LIKE \\? OR tags LIKE \\?").
					WithArgs("%%", "%%", "%%").WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags", "created_at", "updated_at"}).
						AddRow(1, "My First Blog Post", "This is the content of my first blog post.", "Technology", "Tech Programming", "2021-09-01 12:00:00", "2021-09-01 12:00:00").
						AddRow(2, "My Second Blog Post", "This is the content of my second blog post.", "Technology", "Tech Programming", "2021-09-01 12:00:00", "2021-09-01 12:30:00"),
				)
			},
		},

		{
			title:             "GetAllBlogPosts200 filter by term",
			method:            "GET",
			url:               "/posts?term=Second",
			expectStatus:      200,
			expectContentType: "application/json",
			expectBody:        fmt.Sprintf(`[{"id":2,"title":"My Second Blog Post","content":"This is the content of my second blog post.","category":"Technology","tags":["Tech","Programming"],"created_at":"%s","updated_at":"%s"}]`, "2021-09-01T12:00:00Z", "2021-09-01T12:00:00Z"),
			expectSql: func(DBMock sqlmock.Sqlmock) {
				DBMock.ExpectQuery("SELECT id, title, content, category, tags, created_at, updated_at FROM posts WHERE title LIKE \\? OR category LIKE \\? OR tags LIKE \\?").
					WithArgs("%Second%", "%Second%", "%Second%").WillReturnRows(
					sqlmock.NewRows([]string{"id", "title", "content", "category", "tags", "created_at", "updated_at"}).
						AddRow(2, "My Second Blog Post", "This is the content of my second blog post.", "Technology", "Tech Programming", "2021-09-01 12:00:00", "2021-09-01 12:00:00"),
				)
			},
		},
	}

	RegisterHandlers()
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
	SL.Load(DB)
	if test.expectSql != nil {
		test.expectSql(DBMock)
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
	rr := httptest.NewRecorder()
	http.DefaultServeMux.ServeHTTP(rr, req)

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
