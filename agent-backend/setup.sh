#!/bin/bash
# Quick Start Script for Agent Backend

# This script sets up the development environment

echo "🚀 Agent Backend - Setup Script"
echo "================================"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\Activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -e ".[dev,database,langgraph,observability]"
# Test imports
echo ""
echo "🧪 Testing module imports..."
python -c "
from app.core.config import settings
from app.core.database import Base
from app.core.security import verify_jwt_token
from app.api.dependencies import get_current_tenant
from app.models.schemas import Tenant, User, AgentTask
from app.agents.executor import AgentExecutor
from app.tools.definitions import register_tool
from app.monitoring.observability import get_logger
print('✅ All modules imported successfully!')
"

echo ""
echo "✨ Environment ready! Run: python main.py"
echo ""
