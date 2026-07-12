from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from app.models.user import User

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)
with Session(engine) as session:
    users = session.query(User).all()
    print("Users:")
    for u in users:
        print(f"- {u.name}: {u.email} (Role: {u.role})")
