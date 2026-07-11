import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configure test database URL before importing app modules
os.environ["DATABASE_URL"] = "sqlite+pysqlite:///./test_db.db"

from app.core.database import Base, get_db
from app.main import app

@pytest.fixture(scope="session", autouse=True)
def test_database():
    engine = create_engine(
        os.environ["DATABASE_URL"], connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("test_db.db"):
        try:
            os.remove("test_db.db")
        except PermissionError:
            pass

@pytest.fixture
def db_session():
    engine = create_engine(
        os.environ["DATABASE_URL"], connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        engine.dispose()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
