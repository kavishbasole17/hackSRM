import os
from typing import TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.output_parsers import JsonOutputParser
from langgraph.graph import StateGraph, END

from models.domain import SkillTree
from agents.prompts import ARCHITECT_SYSTEM_PROMPT

# Define the state of our Architect graph
class ArchitectState(TypedDict):
    skill: str
    tree: SkillTree | None
    error: str | None

def generate_tree_node(state: ArchitectState):
    """
    Invokes the LLM to generate the SkillTree structure.
    """
    skill = state["skill"]
    
    # We use ChatHuggingFace which correctly maps conversational endpoints
    underlying_llm = HuggingFaceEndpoint(
        repo_id="meta-llama/Meta-Llama-3-8B-Instruct", 
        task="text-generation",
        temperature=0.2,
    )
    llm = ChatHuggingFace(llm=underlying_llm)
    
    # Use JsonOutputParser to enforce structure
    parser = JsonOutputParser(pydantic_object=SkillTree)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", ARCHITECT_SYSTEM_PROMPT + "\n\nCRITICAL: YOU MUST OUTPUT RAW JSON ONLY. DO NOT WRAP THE OUTPUT IN MARKDOWN CODEBLOCKS. DO NOT OUTPUT ANY OTHER TEXT.\n\n{format_instructions}"),
        ("human", "Generate a unified micro-learning path for the skill: {skill}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        # Invoke the chain
        result = chain.invoke({"skill": skill, "format_instructions": parser.get_format_instructions()})
        return {"tree": result, "error": None}
    except Exception as e:
        return {"tree": None, "error": str(e)}

def build_architect_graph():
    """
    Builds and compiles the LangGraph for the Architect Agent.
    """
    workflow = StateGraph(ArchitectState)
    
    # Add nodes
    workflow.add_node("architect", generate_tree_node)
    
    # Set entry and exit edges
    workflow.set_entry_point("architect")
    workflow.add_edge("architect", END)
    
    # Compile the graph
    app = workflow.compile()
    return app

# Expose a compiled instance to be used by the API
architect_agent = build_architect_graph()
