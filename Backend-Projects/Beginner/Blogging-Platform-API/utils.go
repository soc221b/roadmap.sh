package main

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
)

func getPathValueInt(r *http.Request, w http.ResponseWriter, name string) (int, error) {
	value, err := strconv.Atoi(r.PathValue(name))
	if err != nil {
		if errors.Is(err, strconv.ErrSyntax) {
			w.WriteHeader(http.StatusBadRequest)
		} else {
			fmt.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return 0, err
	}
	return value, err
}
