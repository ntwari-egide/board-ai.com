# Quick Start - Backend Integration

## What's Been Done

Complete backend API integration with:

- Authentication (login/signup with Redux)
- Real-time WebSocket communication
- Conversation management
- AI persona selection and orchestration
- Message processing with typing indicators
- File attachment support (service ready)
- Analytics (service ready)

## Quick Setup (3 Steps)

### 1. Create Environment File

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

### 2. Activate Integrated Components

**Option A - Automatic (Recommended)**

```bash
./activate-integration.sh
```

**Option B - Manual**

```bash
# Backup old files
mv src/components/board/BoardLayout.tsx src/components/board/BoardLayout.old.tsx
mv src/components/board/ConversationView.tsx src/components/board/ConversationView.old.tsx
mv src/components/board/ChatInput.tsx src/components/board/ChatInput.old.tsx
mv src/components/board/Sidebar.tsx src/components/board/Sidebar.old.tsx

# Activate integrated versions
mv src/components/board/BoardLayout.integrated.tsx src/components/board/BoardLayout.tsx
mv src/components/board/ConversationView.integrated.tsx src/components/board/ConversationView.tsx
mv src/components/board/ChatInput.integrated.tsx src/components/board/ChatInput.tsx
mv src/components/board/Sidebar.integrated.tsx src/components/board/Sidebar.tsx
```

### 3. Start Development

```bash
# Make sure backend is running at http://localhost:3000
# Then start frontend:
pnpm dev
```

## Documentation

- **[INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)** - Complete setup guide & features
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Code examples & usage patterns
- **[backend.md](./backend.md)** - API documentation from backend

## What Works Now

### Authentication Flow

1. Visit `/auth/login` or `/auth/signup`
2. JWT token automatically stored
3. Protected routes work
4. Auto-logout on token expiration

### Conversation Flow

1. Select AI personas from sidebar
2. Type message and send
3. Backend orchestration triggers all selected AI personas
4. Real-time typing indicators appear
5. AI responses stream in sequentially
6. All data persists to backend

### Features

- Multi-persona selection
- Real-time WebSocket updates
- Conversation history
- Message persistence
- Typing indicators
- Error handling
- File uploads (UI ready, needs full implementation)
- Analytics tracking (service ready)

## Project Structure

```
src/
├── services/           API services (auth, personas, conversations, etc.)
├── store/
│   ├── slices/        Redux state management
│   └── hooks.ts       Typed Redux hooks
├── lib/
│   ├── apiClient.ts   Axios with auth interceptors
│   └── socketService.ts Socket.IO client
├── hooks/
│   └── useConversationSocket.ts WebSocket hook
├── types/
│   └── api.ts         TypeScript types for API
└── components/
    ├── board/         Integrated components
    └── auths/         Updated login/signup
```

## Testing

Test the integration:

1. Register new user
2. Login
3. Select personas (checkbox in sidebar)
4. Send first message (creates conversation)
5. Watch AI personas respond in real-time
6. Send more messages (continue conversation)
7. Switch between conversations in sidebar
8. Logout

## Troubleshooting

**Backend not responding?**

- Check backend runs at `http://localhost:8080`
- Try: `curl http://localhost:8080/api/v1/personas` (should need auth)

**WebSocket not connecting?**

- Check browser console for connection errors
- Verify `NEXT_PUBLIC_SOCKET_URL` in `.env.local`

**401 Errors?**

- Token expired → Logout and login again
- Check backend JWT configuration

**TypeScript Errors?**

```bash
pnpm typecheck
```

## Next Steps

Optional enhancements:

- [ ] Add analytics dashboard UI
- [ ] Implement file upload UI in ChatMessage
- [ ] Add conversation search
- [ ] Export conversations feature
- [ ] Dark mode theme
- [ ] Mobile responsive improvements

## Support

- Backend API docs: `http://localhost:8080/docs`
- Check console logs for debugging
- Review Redux DevTools for state inspection

---

Ready to go! Start your backend, run `pnpm dev`, and test the full integration.
