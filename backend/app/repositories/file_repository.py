from app.repositories.base_repository import BaseRepository
from app.models.file import File

class FileRepository(BaseRepository[File]):
    def __init__(self, db):
        super().__init__(db, File)