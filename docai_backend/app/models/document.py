from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    content_type: str
    size: int

class DocumentCreate(DocumentBase):
    pass

class Document(DocumentBase):
    id: int
    upload_time: datetime
    processed: bool = False
    processed_time: Optional[datetime] = None
    summary: Optional[str] = None
    keywords: List[str] = []
    
    class Config:
        orm_mode = True

class DocumentProcessingResult(BaseModel):
    document_id: int
    status: str
    message: str
    summary: Optional[str] = None
    keywords: List[str] = []
