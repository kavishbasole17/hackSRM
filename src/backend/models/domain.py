from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from sqlmodel import SQLModel, Field as SQLField

# -------------------------------------------------------------------------
# Pydantic Schemas (For Agent Output & API Validation)
# -------------------------------------------------------------------------

class SkillNode(BaseModel):
    """
    Represents a single micro-lesson node in the skill tree.
    """
    id: str = Field(..., description="A unique, URL-safe identifier for the node (e.g., 'intro-to-python').")
    title: str = Field(..., description="The human-readable title of the node.")
    level: str = Field(default="Mid", description="Difficulty level: Root, Mid, or Advanced.")
    prerequisites: List[str] = Field(default_factory=list, description="List of node IDs that must be completed before this one.")
    video_url: Optional[str] = Field(default="", description="Youtube URL relevant to the topic.")
    summary: str = Field(default="Learn the fundamentals of this topic.", description="A summary of what this node teaches.")

class SkillTree(BaseModel):
    """
    Represents the full Directed Acyclic Graph (DAG) for a skill.
    """
    skill: str = Field(..., description="The main skill requested by the user.")
    nodes: List[SkillNode] = Field(..., description="List of all nodes in the skill tree.")

# -------------------------------------------------------------------------
# Database Models (SQLModel)
# -------------------------------------------------------------------------

class UserProgress(SQLModel, table=True):
    """
    Tracks a user's progress through the skill tree nodes.
    """
    id: Optional[int] = SQLField(default=None, primary_key=True)
    user_id: str = SQLField(index=True)
    skill_name: str = SQLField()
    node_id: str = SQLField(index=True)
    status: str = SQLField(default="locked")  # locked, unlocked, completed
    content: Optional[str] = SQLField(default=None)  # Markdown lesson cache
