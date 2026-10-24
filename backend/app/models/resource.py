from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator

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
    subject: str = Field(..., description="Main academic field (Computer Science, Mathematics, etc.)")
    subfields: List[str] = Field(default_factory=list, description="Specific subfields or subject areas")
    subtopic: Optional[str] = Field(None, description="Specific subtopic or syllabus module")
    keywords: List[str] = Field(default_factory=list, description="Indexable subject keywords")
    level: DifficultyLevel = Field(default=DifficultyLevel.INTERMEDIATE, description="Academic difficulty level")
    resource_type: ResourceType = Field(default=ResourceType.TEXTBOOK, description="Material format")
    abstract: str = Field(default="", description="Brief syllabus/abstract describing content")
    description: Optional[str] = Field(None, description="Detailed syllabus or course module description")
    prerequisites: List[str] = Field(default_factory=list, description="Required background knowledge")
    learning_outcomes: List[str] = Field(default_factory=list, description="Specific competencies mastered upon study")
    call_number: Optional[str] = Field(None, description="Library shelf call number")
    url: Optional[str] = Field(None, description="Official DOI, open-access link or library URL")
    isbn: Optional[str] = Field(None, description="Verified ISBN (10 or 13 digits) if verified")
    doi: Optional[str] = Field(None, description="Digital Object Identifier if verified")
    access_type: str = Field(default="University Subscription", description="Open-Access, University Subscription, Physical Library, etc.")
    publication_year: Optional[int] = Field(None, description="Year published")
    borrow_count: int = Field(default=0, description="Historical circulation proxy (used for discovery bonus)")
    quality_rating: float = Field(default=4.5, ge=1.0, le=5.0, description="Faculty/curator quality assessment (1-5)")
    verified_metadata: bool = Field(default=True, description="Distinguishes verified publisher records from demo descriptions")
    provenance_note: Optional[str] = Field(None, description="Bibliographic verification provenance note")

    @model_validator(mode="before")
    @classmethod
    def sync_abstract_and_description(cls, values):
        if isinstance(values, dict):
            # Fallback abstract <-> description
            desc = values.get("description")
            abst = values.get("abstract")
            if not abst and desc:
                values["abstract"] = desc
            elif not desc and abst:
                values["description"] = abst
            elif not abst and not desc:
                values["abstract"] = values.get("title", "Academic library resource.")
                values["description"] = values["abstract"]
            
            # Fallback subtopic <-> subfields
            subfields = values.get("subfields", [])
            subtopic = values.get("subtopic")
            if not subtopic and subfields:
                values["subtopic"] = subfields[0]
            elif subtopic and not subfields:
                values["subfields"] = [subtopic]
        return values

    @property
    def level_numeric(self) -> int:
        return DIFFICULTY_NUMERIC_MAP.get(self.level, 2)

    @property
    def primary_subtopic(self) -> str:
        return self.subtopic or (self.subfields[0] if self.subfields else self.subject)

