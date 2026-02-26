# Node-It-All (HackSRM)

Node-It-All is an AI-powered micro-learning platform that generates personalized skill trees and interactive learning content using advanced Large Language Model (LLM) agents.

## 🚀 Features

- **Dynamic Skill Tree Generation**: Uses an AI "Architect Agent" to create structured learning paths (DAGs) for any given skill or topic.
- **Interactive Learning Nodes**: Content generated on-the-fly for each node in the skill tree (Planned).
- **Progress Verification**: "Gatekeeper Agent" to validate understanding through quizzes and exercises (Planned).
- **Modern Tech Stack**: Built with FastAPI, React, LangChain/LangGraph, and PostgreSQL.

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/LLM**: LangChain, LangGraph, Hugging Face (Meta-Llama-3-8B-Instruct)
- **Database**: PostgreSQL (SQLModel)
- **Agents**: Architect, Content Generator, Gatekeeper

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Standard CSS / Tailwind (if applicable)
- **State Management**: React Hooks



## 📋 Prerequisites

- [Hugging Face API Token](https://huggingface.co/settings/tokens) (Required for AI features)
- [Node.js](https://nodejs.org/) (Optional, for local frontend dev)
- [Python 3.10+](https://www.python.org/) (Optional, for local backend dev)

## ⚡ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kavishbasole17/hackSRM.git
cd hackSRM
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
POSTGRES_USER=nexus_user
POSTGRES_PASSWORD=nexus_password
POSTGRES_DB=nexus_learn
DATABASE_URL=postgresql://nexus_user:nexus_password@db:5432/nexus_learn

# AI Configuration
HUGGINGFACEHUB_API_TOKEN=your_huggingface_api_token_here
```

**Note:** Ensure that `HUGGINGFACEHUB_API_TOKEN` is correctly passed to the backend service. You may need to add it to `docker-compose.yml` or ensure your `.env` file is loaded by Docker Compose.

### 3. Run with Docker Compose

Build and start the services:

```bash
docker-compose up --build
```

Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📂 Project Structure

```
hackSRM/
├── docs/                # Documentation files
├── src/
│   ├── backend/         # FastAPI backend source code
│   │   ├── agents/      # LangGraph agents (Architect, etc.)
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Data models
│   │   └── requirements.txt
│   └── frontend/        # React frontend source code
```

## 📝 API Endpoints

- `POST /tree/generate`: Generate a skill tree for a given topic.
- `GET /node/{id}/content`: Get learning content for a node.
- `POST /node/{id}/verify`: Verify answer for a node quiz.
- `GET /health`: Health check.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
