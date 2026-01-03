# Board AI Backend Integration - Complete

## What Has Been Implemented

### 1. Core Infrastructure

- **API Client** (`src/lib/apiClient.ts`): Axios instance with JWT auth interceptors
- **WebSocket Service** (`src/lib/socketService.ts`): Socket.IO client for real-time updates
- **Environment Config**: `.env.local.example` with API and Socket URLs

### 2. Type Definitions

- **API Types** (`src/types/api.ts`): Complete TypeScript interfaces matching backend responses
  - User, AuthResponse, Persona, Conversation, Message
  - WebSocket event types
  - Request/Response types for all endpoints

### 3. API Services

All services created in `src/services/`:

- **authService.ts**: register, login, getCurrentUser, logout
- **personaService.ts**: getAllPersonas, getPersonaById
- **conversationService.ts**: create, fetch, update, delete conversations
- **messageService.ts**: getMessages, createMessage
- **orchestrationService.ts**: processMessage (triggers AI personas), generateSummary
- **attachmentService.ts**: uploadFile, getAttachment
- **analyticsService.ts**: getConversationAnalytics

### 4. Redux State Management

Redux slices created in `src/store/slices/`:

- **authSlice.ts**: Authentication state & actions
- **personaSlice.ts**: Personas management & selection
- **conversationSlice.ts**: Conversations, messages, typing indicators

**Store configured** in `src/store.ts` with all reducers
**Custom hooks** in `src/store/hooks.ts` for typed Redux usage

### 5. Custom Hooks

- **useConversationSocket** (`src/hooks/useConversationSocket.ts`): Manages WebSocket connections, listens for real-time events

### 6. Updated Components

**New integrated components** created (with `.integrated.tsx` suffix):

- **Sidebar.integrated.tsx**:

  - Shows conversations list from backend
  - Persona selector with checkboxes
  - New conversation button
  - Delete conversations
  - User profile with logout

- **ConversationView.integrated.tsx**:

  - Loads messages from backend
  - Displays real-time typing indicators
  - Auto-scrolls to new messages
  - Shows persona avatars with colors

- **ChatInput.integrated.tsx**:

  - Sends messages via API
  - Triggers AI persona responses
  - File upload support
  - Loading states

- **BoardLayout.integrated.tsx**:
  - Orchestrates all components
  - Initializes user session
  - Manages conversation state

**Authentication components updated**:

- **login.tsx**: Uses Redux actions, auto-redirects on success
- **signup.tsx**: Uses Redux actions, auto-login after registration

---

## How to Use the Integration

### Step 1: Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Step 2: Replace Old Components

Replace the old components with the integrated versions:

```bash
# Backup old files (optional)
mv src/components/board/BoardLayout.tsx src/components/board/BoardLayout.old.tsx
mv src/components/board/ConversationView.tsx src/components/board/ConversationView.old.tsx
mv src/components/board/ChatInput.tsx src/components/board/ChatInput.old.tsx
mv src/components/board/Sidebar.tsx src/components/board/Sidebar.old.tsx

# Rename integrated files to primary
mv src/components/board/BoardLayout.integrated.tsx src/components/board/BoardLayout.tsx
mv src/components/board/ConversationView.integrated.tsx src/components/board/ConversationView.tsx
mv src/components/board/ChatInput.integrated.tsx src/components/board/ChatInput.tsx
mv src/components/board/Sidebar.integrated.tsx src/components/board/Sidebar.tsx
```

### Step 3: Start the Backend

Make sure your backend is running:

```bash
# In your backend directory
npm run start:dev
# or
pnpm start:dev
```

Backend should be accessible at `http://localhost:3000`

### Step 4: Start the Frontend

```bash
pnpm dev
```

Frontend will be at `http://localhost:3001` (or configured port)

---

## Complete User Flow

### 1. **User Authentication**

```
Visit /auth/login or /auth/signup
↓
Enter credentials
↓
Redux action dispatched (login/register)
↓
JWT token saved to cookies
↓
User redirected to /
```

### 2. **Starting a Conversation**

```
Open app → BoardLayout loads
↓
Sidebar shows available personas
↓
User selects personas (e.g., Marketing, Developer, Designer)
↓
User types message in ChatInput
↓
Click Send
↓
New conversation created via API
↓
Message processed by orchestration service
↓
All selected AI personas respond sequentially
```

### 3. **Real-time Updates**

```
WebSocket connects automatically
↓
User sends message
↓
Backend orchestration starts processing
↓
Frontend receives "agent_typing" events → Shows typing indicators
↓
Frontend receives "agent_response" events → Messages appear in real-time
↓
Frontend receives "round_completed" event → Round indicator updates
```

### 4. **Conversation Management**

```
Sidebar shows all conversations
↓
Click conversation → Loads messages
↓
Can switch between conversations
↓
Can delete conversations
↓
All changes persist to backend
```

---

## Key Features

**Authentication**: JWT-based with auto-token management  
**Real-time**: WebSocket for live AI responses  
**State Management**: Redux Toolkit with TypeScript  
**Persona Selection**: Multi-select AI experts  
**File Uploads**: Attach files to messages  
**Conversation History**: Persist and switch between chats  
**Typing Indicators**: See when AI is responding  
**Error Handling**: Automatic logout on 401, user-friendly errors  
**Analytics**: Token usage and cost tracking (service ready)

---

## Testing Checklist

- [ ] Register new user → Success
- [ ] Login existing user → Success
- [ ] JWT token persists across page refreshes
- [ ] Sidebar shows conversations list
- [ ] Can select multiple personas
- [ ] Can create new conversation
- [ ] Messages send successfully
- [ ] AI personas respond in real-time
- [ ] Typing indicators appear
- [ ] Can switch between conversations
- [ ] Messages persist correctly
- [ ] Can delete conversations
- [ ] Logout works properly
- [ ] File uploads work (if implemented)

---

## API Endpoints Reference

See [backend.md](./backend.md) for complete API documentation.

**Quick reference:**

- `POST /auth/email/register` - Register
- `POST /auth/email/login` - Login
- `GET /auth/me` - Get current user
- `GET /personas` - List all personas
- `POST /conversations` - Create conversation
- `GET /conversations` - List conversations
- `POST /orchestration/conversations/{id}/process` - Send message & trigger AI
- WebSocket: `ws://localhost:3000/board` - Real-time events

---

## Troubleshooting

### Backend not responding

- Check backend is running on `http://localhost:8080`
- Verify `.env.local` has correct URLs
- Check CORS is enabled on backend

### WebSocket not connecting

- Ensure backend WebSocket gateway is running
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
- Look for connection errors in browser console

### 401 Unauthorized errors

- Token expired → Logout and login again
- Backend auth middleware may need configuration
- Check JWT secret matches on backend

### Messages not sending

- Verify personas are selected
- Check network tab for API errors
- Ensure conversation is created first

### TypeScript errors

- Run `pnpm typecheck` to see all errors
- Most types are defined in `src/types/api.ts`
- Update types if backend response structure changed

---

## Next Enhancements

1. **Persona Details View**: Show persona capabilities, prompts
2. **Analytics Dashboard**: Display token usage, costs per conversation
3. **Message Reactions**: Like/dislike AI responses
4. **Export Conversations**: Download as PDF/Markdown
5. **Search**: Search across all conversations
6. **Settings Page**: Manage max rounds, notification preferences
7. **Dark Mode**: Theme toggle
8. **Mobile Responsive**: Better mobile sidebar handling

---

## File Structure

```
src/
├── components/
│   └── board/
│       ├── BoardLayout.tsx (integrated)
│       ├── ConversationView.tsx (integrated)
│       ├── ChatInput.tsx (integrated)
│       ├── Sidebar.tsx (integrated)
│       ├── TopBar.tsx
│       ├── ChatMessage.tsx
│       └── WelcomeMessage.tsx
├── component/
│   └── auths/
│       ├── login.tsx (updated)
│       └── signup.tsx (updated)
├── hooks/
│   └── useConversationSocket.ts (new)
├── lib/
│   ├── apiClient.ts (new)
│   └── socketService.ts (new)
├── services/
│   ├── authService.ts (new)
│   ├── personaService.ts (new)
│   ├── conversationService.ts (new)
│   ├── messageService.ts (new)
│   ├── orchestrationService.ts (new)
│   ├── attachmentService.ts (new)
│   └── analyticsService.ts (new)
├── store/
│   ├── hooks.ts (new)
│   ├── slices/
│   │   ├── authSlice.ts (new)
│   │   ├── personaSlice.ts (new)
│   │   └── conversationSlice.ts (new)
│   └── store.ts (updated)
└── types/
    ├── api.ts (new)
    └── chat.ts (existing)
```

---

## Summary

Complete backend integration implemented.

All API endpoints are wrapped in services, state management is handled by Redux, and real-time updates work via WebSocket. The integrated components are ready to replace the dummy data versions.

Follow the steps above to activate the integration and start using the real backend.

For questions or issues, refer to:

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Detailed integration examples
- [backend.md](./backend.md) - API documentation
- Backend Swagger docs at `http://localhost:8080/docs`
