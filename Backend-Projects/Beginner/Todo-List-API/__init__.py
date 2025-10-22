from dotenv import load_dotenv
from models.todo import todos_db, Todo
from models.user import users_db, User

load_dotenv()

todos_db.connect()
todos_db.create_tables([Todo])

users_db.connect()
users_db.create_tables([User])
