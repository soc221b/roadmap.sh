from peewee import Model, SqliteDatabase, CharField, ForeignKeyField
from models.user import User

todos_db = SqliteDatabase('todos.db')


class Todo(Model):
    title = CharField()
    description = CharField()
    user = ForeignKeyField(User)

    class Meta:
        database = todos_db
