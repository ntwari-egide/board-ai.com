/\*\*

- Comprehensive Board AI Frontend Integration
-
- This document provides implementation examples and guidelines for integrating
- the Board AI backend API with the React/Next.js frontend.
  \*/

# 1. Setup & Configuration

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

# 2. Key Integration Points

## A. Authentication Flow

The authentication flow has been integrated using Redux Toolkit:

- **Login Component** (`src/component/auths/login.tsx`)

  - Uses Redux `login` action
  - Automatically stores JWT token in cookies
  - Redirects on successful authentication

- **Signup Component** (`src/component/auths/signup.tsx`)
  - Uses Redux `register` action
  - Auto-login after registration
  - Handles validation errors

### Usage Example:

```typescript
import { useAppDispatch } from '@/store/hooks';
import { login, getCurrentUser } from '@/store/slices/authSlice';

// In your component
const dispatch = useAppDispatch();

// Login
await dispatch(login({ email, password })).unwrap();

// Get current user
await dispatch(getCurrentUser()).unwrap();
```

## B. Conversation Management

### Creating a New Conversation:

```typescript
import { createConversation } from '@/store/slices/conversationSlice';

await dispatch(
  createConversation({
    title: 'Product Launch Strategy',
    activePersonas: ['marketing', 'developer', 'designer'],
    maxRounds: 3,
  })
).unwrap();
```

### Fetching Conversations:

```typescript
import {
  fetchConversations,
  fetchConversationById,
} from '@/store/slices/conversationSlice';

// Get all conversations
await dispatch(fetchConversations({ page: 1, limit: 20 })).unwrap();

// Get specific conversation
await dispatch(fetchConversationById(conversationId)).unwrap();
```

## C. Message Processing

### Sending a Message (triggers all AI personas):

```typescript
import { processMessage } from '@/store/slices/conversationSlice';

await dispatch(
  processMessage({
    conversationId: currentConversation.id,
    message: 'How should we approach our product launch?',
  })
).unwrap();
```

## D. WebSocket Integration

Use the custom hook for real-time updates:

```typescript
import useConversationSocket from '@/hooks/useConversationSocket';

function ConversationView({ conversationId }) {
  const { disconnect } = useConversationSocket(conversationId);

  // Component will automatically receive:
  // - agent_typing events
  // - agent_response events
  // - round_completed events
  // - status_change events

  useEffect(() => {
    return () => disconnect();
  }, []);
}
```

## E. Persona Management

```typescript
import { fetchPersonas, togglePersona } from '@/store/slices/personaSlice';

// Fetch all available personas
await dispatch(fetchPersonas()).unwrap();

// Toggle persona selection
dispatch(togglePersona('marketing'));

// Access selected personas
const { selectedPersonas } = useAppSelector((state) => state.persona);
```

# 3. Component Integration Examples

## Updated BoardLayout Component

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createConversation,
  processMessage,
} from '@/store/slices/conversationSlice';
import { fetchPersonas } from '@/store/slices/personaSlice';
import useConversationSocket from '@/hooks/useConversationSocket';

export default function BoardLayout() {
  const dispatch = useAppDispatch();
  const { currentConversation, messages, processingMessage } = useAppSelector(
    (state) => state.conversation
  );
  const { personas, selectedPersonas } = useAppSelector(
    (state) => state.persona
  );
  const { user } = useAppSelector((state) => state.auth);

  // Initialize WebSocket
  useConversationSocket(currentConversation?.id || null);

  useEffect(() => {
    // Load personas on mount
    dispatch(fetchPersonas());
  }, [dispatch]);

  const handleStartConversation = async (message: string) => {
    if (!selectedPersonas.length) {
      alert('Please select at least one persona');
      return;
    }

    // Create conversation
    const conversation = await dispatch(
      createConversation({
        title: message.slice(0, 50),
        activePersonas: selectedPersonas,
        maxRounds: 3,
      })
    ).unwrap();

    // Process first message
    await dispatch(
      processMessage({
        conversationId: conversation.id,
        message,
      })
    ).unwrap();
  };

  return <div className='board-layout'>{/* Your UI components */}</div>;
}
```

## Updated ConversationView Component

```typescript
'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import ChatMessage from './ChatMessage';

export default function ConversationView() {
  const { messages, typingAgents, messagesLoading } = useAppSelector(
    (state) => state.conversation
  );
  const { personas } = useAppSelector((state) => state.persona);

  // Get persona details for each message
  const getPersona = (agentType: string) => {
    return personas.find((p) => p.id === agentType);
  };

  return (
    <div className='conversation-view'>
      {messagesLoading && <div>Loading messages...</div>}

      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          persona={
            message.agentType ? getPersona(message.agentType) : undefined
          }
        />
      ))}

      {/* Typing Indicators */}
      {typingAgents.map((agent) => (
        <div key={agent.agentType} className='typing-indicator'>
          {agent.agentName} is typing...
        </div>
      ))}
    </div>
  );
}
```

## Updated ChatInput Component

```typescript
'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  processMessage,
  createConversation,
} from '@/store/slices/conversationSlice';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const dispatch = useAppDispatch();
  const { currentConversation, processingMessage } = useAppSelector(
    (state) => state.conversation
  );
  const { selectedPersonas } = useAppSelector((state) => state.persona);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentConversation) {
      // Create new conversation
      const conversation = await dispatch(
        createConversation({
          title: input.slice(0, 50),
          activePersonas: selectedPersonas,
          maxRounds: 3,
        })
      ).unwrap();

      // Process message
      await dispatch(
        processMessage({
          conversationId: conversation.id,
          message: input,
        })
      ).unwrap();
    } else {
      // Process message in existing conversation
      await dispatch(
        processMessage({
          conversationId: currentConversation.id,
          message: input,
        })
      ).unwrap();
    }

    setInput('');
  };

  return (
    <div className='chat-input'>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={processingMessage}
        placeholder='Type your message...'
      />
      <button
        onClick={handleSend}
        disabled={processingMessage || !input.trim()}
      >
        {processingMessage ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}
```

## Updated Sidebar Component

```typescript
'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  setCurrentConversation,
} from '@/store/slices/conversationSlice';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const { conversations, loading, currentConversation } = useAppSelector(
    (state) => state.conversation
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchConversations({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) {
      dispatch(setCurrentConversation(conversation));
    }
  };

  return (
    <div className='sidebar'>
      <div className='user-info'>
        {user?.firstName} {user?.lastName}
      </div>

      {loading && <div>Loading conversations...</div>}

      <div className='conversations-list'>
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => handleSelectConversation(conv.id)}
            className={currentConversation?.id === conv.id ? 'active' : ''}
          >
            <h4>{conv.title}</h4>
            <span>{conv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

# 4. File Upload Integration

```typescript
import attachmentService from '@/services/attachmentService';

async function handleFileUpload(file: File, messageId: string) {
  try {
    const attachment = await attachmentService.uploadFile(file, messageId);
    console.log('File uploaded:', attachment.publicUrl);
    return attachment;
  } catch (error) {
    console.error('File upload failed:', error);
  }
}
```

# 5. Analytics Integration

```typescript
import analyticsService from '@/services/analyticsService';

async function loadConversationAnalytics(conversationId: string) {
  try {
    const analytics = await analyticsService.getConversationAnalytics(
      conversationId
    );
    console.log('Token usage:', analytics.totalTokens);
    console.log('Cost:', analytics.estimatedCost);
    console.log('Agent participation:', analytics.agentParticipation);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}
```

# 6. Error Handling

All services automatically handle:

- 401 Unauthorized → Auto-logout and redirect to login
- Network errors → Display user-friendly messages
- Validation errors → Show field-specific errors

Access errors via Redux state:

```typescript
const { error } = useAppSelector((state) => state.conversation);

useEffect(() => {
  if (error) {
    message.error(error);
  }
}, [error]);
```

# 7. Protected Routes

Create a protected route component:

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      dispatch(getCurrentUser()).catch(() => {
        router.push('/auth/login');
      });
    }
  }, [isAuthenticated, loading, dispatch, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
```

# 8. Next Steps

1. ✅ API client and services created
2. ✅ Redux slices for state management
3. ✅ WebSocket integration with custom hook
4. ✅ Authentication components updated
5. ⏳ Update remaining board components (BoardLayout, ConversationView, ChatInput, Sidebar)
6. ⏳ Add persona selection UI
7. ⏳ Implement file upload UI
8. ⏳ Add analytics dashboard
9. ⏳ Test end-to-end flow

# 9. Testing Checklist

- [ ] User can register and login
- [ ] User can view available personas
- [ ] User can create a new conversation with selected personas
- [ ] User can send messages
- [ ] Real-time typing indicators appear
- [ ] AI personas respond in sequence
- [ ] Messages persist across page refreshes
- [ ] User can switch between conversations
- [ ] File attachments work
- [ ] Analytics data displays correctly
- [ ] Logout works properly

---

All core services, Redux slices, and utilities have been created and are ready to use.
The components need to be updated to use these new integrations instead of dummy data.
