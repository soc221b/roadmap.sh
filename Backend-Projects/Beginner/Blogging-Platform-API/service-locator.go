package main

import "database/sql"

type ServiceLocator struct {
	DB *sql.DB
}

var SL = ServiceLocator{}

func (SL *ServiceLocator) Load(value any) {
	switch v := value.(type) {
	case *sql.DB:
		SL.DB = v
	}
}
