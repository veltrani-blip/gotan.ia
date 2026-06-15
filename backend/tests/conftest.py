import pytest

from app.repository import InMemoryRepository, set_repository


@pytest.fixture(autouse=True)
def fresh_repo():
    """Cada teste recebe um repositório em memória limpo."""
    repo = InMemoryRepository()
    set_repository(repo)
    yield repo
