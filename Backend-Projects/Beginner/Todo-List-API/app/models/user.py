from peewee import Model, SqliteDatabase, CharField

users_db = SqliteDatabase('users.db')


class User(Model):
    name = CharField()
    email = CharField()
    password = CharField()

    class Meta:
        database = users_db
