from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class DifficultyLevel(str, Enum):
    INTRODUCTORY = "Introductory"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    RESEARCH = "Research"

DIFFICULTY_NUMERIC_MAP = {
    DifficultyLevel.INTRODUCTORY: 1,
    DifficultyLevel.INTERMEDIATE: 2,
    DifficultyLevel.ADVANCED: 3,
    DifficultyLevel.RESEARCH: 4,
}

class ResourceType(str, Enum):
    TEXTBOOK = "Textbook"
    MONOGRAPH = "Monograph"
    SURVEY_PAPER = "Survey Paper"
    LECTURE_NOTES = "Lecture Notes"
    OPEN_ACCESS = "Open-Access Resource"

class AcademicResource(BaseModel):
    id: str = Field(..., description="Unique resource ID (e.g. RES-CS-001)")
    title: str = Field(..., description="Title of the resource")
    authors: List[str] = Field(default_factory=list, description="Authors or editors")
    subject: str = Field(..., description="Main academic field")
    subfields: List[str] = Field(default_factory=list, description="Specific subfields")
    keywords: List[str] = Field(default_factory=list, description="Indexable subject keywords")
    level: DifficultyLevel = Field(..., description="Academic difficulty level")
    resource_type: ResourceType = Field(default=ResourceType.TEXTBOOK, description="Material format")
    abstract: str = Field(..., description="Brief syllabus/abstract describing content")
    prerequisites: List[str] = Field(default_factory=list, description="Required background knowledge")
    call_number: Optional[str] = Field(None, description="Library shelf call number")
    url: Optional[str] = Field(None, description="Official DOI, open-access link or library URL")
    publication_year: Optional[int] = Field(None, description="Year published")
    borrow_count: int = Field(default=0, description="Historical borrow count (used for long-tail discovery bonus analysis)")
    quality_rating: float = Field(default=4.5, ge=1.0, le=5.0, description="Faculty/curator quality assessment (1-5)")

    @property
    def level_numeric(self) -> int:
        return DIFFICULTY_NUMERIC_MAP[self.level]
