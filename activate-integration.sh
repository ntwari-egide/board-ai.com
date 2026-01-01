#!/bin/bash

# Board AI - Switch to Integrated Components Script
# This script renames the old components and activates the integrated versions

echo "Board AI - Activating Backend Integration"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -d "src/components/board" ]; then
    echo "Error: This script must be run from the project root directory"
    exit 1
fi

echo "Step 1: Backing up original components..."

# Backup original files
if [ -f "src/components/board/BoardLayout.tsx" ]; then
    mv src/components/board/BoardLayout.tsx src/components/board/BoardLayout.old.tsx
    echo "Done: BoardLayout.tsx -> BoardLayout.old.tsx"
fi

if [ -f "src/components/board/ConversationView.tsx" ]; then
    mv src/components/board/ConversationView.tsx src/components/board/ConversationView.old.tsx
    echo "Done: ConversationView.tsx -> ConversationView.old.tsx"
fi

if [ -f "src/components/board/ChatInput.tsx" ]; then
    mv src/components/board/ChatInput.tsx src/components/board/ChatInput.old.tsx
    echo "Done: ChatInput.tsx -> ChatInput.old.tsx"
fi

if [ -f "src/components/board/Sidebar.tsx" ]; then
    mv src/components/board/Sidebar.tsx src/components/board/Sidebar.old.tsx
    echo "Done: Sidebar.tsx -> Sidebar.old.tsx"
fi

echo ""
echo "Step 2: Activating integrated components..."

# Activate integrated versions
if [ -f "src/components/board/BoardLayout.integrated.tsx" ]; then
    mv src/components/board/BoardLayout.integrated.tsx src/components/board/BoardLayout.tsx
    echo "Done: BoardLayout.integrated.tsx -> BoardLayout.tsx"
fi

if [ -f "src/components/board/ConversationView.integrated.tsx" ]; then
    mv src/components/board/ConversationView.integrated.tsx src/components/board/ConversationView.tsx
    echo "Done: ConversationView.integrated.tsx -> ConversationView.tsx"
fi

if [ -f "src/components/board/ChatInput.integrated.tsx" ]; then
    mv src/components/board/ChatInput.integrated.tsx src/components/board/ChatInput.tsx
    echo "Done: ChatInput.integrated.tsx -> ChatInput.tsx"
fi

if [ -f "src/components/board/Sidebar.integrated.tsx" ]; then
    mv src/components/board/Sidebar.integrated.tsx src/components/board/Sidebar.tsx
    echo "Done: Sidebar.integrated.tsx -> Sidebar.tsx"
fi

echo ""
echo "Step 3: Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "Created .env.local from .env.local.example"
        echo "Please review .env.local and update if needed"
    else
        echo "Warning: .env.local not found. Please create one with:"
        echo "   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1"
        echo "   NEXT_PUBLIC_SOCKET_URL=http://localhost:8080"
    fi
else
    echo ".env.local exists"
fi

echo ""
echo "============================================"
echo "Integration Complete!"
echo ""
echo "Next Steps:"
echo "   1. Make sure your backend is running at http://localhost:8080"
echo "   2. Review .env.local settings"
echo "   3. Start the dev server: pnpm dev"
echo "   4. Visit http://localhost:3001 (or your configured port)"
echo ""
echo "Documentation:"
echo "   - INTEGRATION_COMPLETE.md - Setup guide"
echo "   - INTEGRATION_GUIDE.md - Code examples"
echo "   - backend.md - API documentation"
echo ""
echo "To revert changes:"
echo "   - Restore from .old.tsx backup files"
echo ""
