import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import conversationService from '@/services/conversationService';
import messageService from '@/services/messageService';
import orchestrationService from '@/services/orchestrationService';
import {
  Conversation,
  Message,
  CreateConversationRequest,
  UpdateConversationRequest,
  ProcessMessageRequest,
} from '@/types/api';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  typingAgents: { agentType: string; agentName: string }[];
  streamingChunks: Record<string, string>;
  streamingMessages: Record<string, Message>;
  loading: boolean;
  messagesLoading: boolean;
  processingMessage: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const mergeMessages = (existing: Message[], incoming: Message[]): Message[] => {
  const byId = new Map<string, Message>();
  existing.forEach((m) => {
    if (m?.id) byId.set(m.id, m);
  });
  incoming.forEach((m) => {
    if (m?.id) {
      byId.set(m.id, m);
    } else {
      // Fallback for messages without id
      byId.set(`tmp-${byId.size + 1}-${Date.now()}`, m);
    }
  });
  return Array.from(byId.values());
};

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  typingAgents: [],
  streamingChunks: {},
  streamingMessages: {},
  loading: false,
  messagesLoading: false,
  processingMessage: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Async thunks
export const createConversation = createAsyncThunk(
  'conversation/create',
  async (data: CreateConversationRequest, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.createConversation(data);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create conversation');
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'conversation/fetchAll',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await conversationService.getUserConversations(page, limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
    }
  }
);

export const fetchConversationById = createAsyncThunk(
  'conversation/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.getConversationById(id);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation');
    }
  }
);

export const updateConversation = createAsyncThunk(
  'conversation/update',
  async ({ id, data }: { id: string; data: UpdateConversationRequest }, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.updateConversation(id, data);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update conversation');
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'conversation/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await conversationService.deleteConversation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete conversation');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'conversation/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const messages = await messageService.getMessages(conversationId);
      return messages;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'conversation/sendMessage',
  async ({ conversationId, content }: { conversationId: string; content: string }, { rejectWithValue }) => {
    try {
      const message = await messageService.createMessage(conversationId, { content });
      return message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const processMessage = createAsyncThunk(
  'conversation/processMessage',
  async (
    { conversationId, message }: { conversationId: string; message: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await orchestrationService.processMessage(conversationId, { message });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process message');
    }
  }
);

export const stepConversation = createAsyncThunk(
  'conversation/stepConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const result = await conversationService.stepConversation(conversationId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to step conversation');
    }
  }
);

export const generateSummary = createAsyncThunk(
  'conversation/generateSummary',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await orchestrationService.generateSummary(conversationId);
      return response.data.summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate summary');
    }
  }
);

// Slice
const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      // Preserve existing messages when setting the same conversation without message payload (e.g., list click refresh)
      const incoming = action.payload;
      const sameConversation = incoming && state.currentConversation?.id === incoming.id;

      state.currentConversation = incoming;

      if (!incoming) {
        state.messages = [];
        return;
      }

      if (Array.isArray(incoming.messages) && incoming.messages.length > 0) {
        state.messages = mergeMessages(state.messages || [], incoming.messages as Message[]);
      } else if (!sameConversation) {
        state.messages = [];
      }
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.typingAgents = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      state.messages.push(action.payload);
    },
    upsertStreamingMessage: (state, action: PayloadAction<{ personaId: string; chunk: string }>) => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      const streamId = `stream-${action.payload.personaId}`;
      const existing = state.messages.find((m) => m.id === streamId);
      if (existing) {
        existing.content = (existing.content || '') + action.payload.chunk;
      } else {
        const msg: Message = {
          id: streamId,
          role: 'AGENT',
          agentType: action.payload.personaId,
          content: action.payload.chunk,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as any;
        state.messages.push(msg);
      }
      state.streamingMessages[action.payload.personaId] = state.messages.find((m) => m.id === streamId) as Message;
    },
    finalizeStreamingMessage: (state, action: PayloadAction<{ personaId: string; message: Message }>) => {
      // Remove temp stream message if present
      const streamId = `stream-${action.payload.personaId}`;
      state.messages = state.messages.filter((m) => m.id !== streamId);
      delete state.streamingMessages[action.payload.personaId];

      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      state.messages.push(action.payload.message);
    },
    addTypingAgent: (state, action: PayloadAction<{ agentType: string; agentName: string }>) => {
      const exists = state.typingAgents.some(
        agent => agent.agentType === action.payload.agentType
      );
      if (!exists) {
        state.typingAgents.push(action.payload);
      }
    },
    removeTypingAgent: (state, action: PayloadAction<string>) => {
      state.typingAgents = state.typingAgents.filter(
        agent => agent.agentType !== action.payload
      );
    },
    clearTypingAgents: (state) => {
      state.typingAgents = [];
    },
    setStreamingChunk: (state, action: PayloadAction<{ agentType: string; chunk: string }>) => {
      state.streamingChunks[action.payload.agentType] = action.payload.chunk;
    },
    clearStreamingChunk: (state, action: PayloadAction<string>) => {
      delete state.streamingChunks[action.payload];
      delete state.streamingMessages[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
        state.messages = [];
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch conversation by ID
    builder
      .addCase(fetchConversationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action: PayloadAction<Conversation>) => {
        state.loading = false;
        state.currentConversation = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update conversation
    builder
      .addCase(updateConversation.fulfilled, (state, action: PayloadAction<Conversation>) => {
        const index = state.conversations.findIndex(c => c.id === action.payload.id);
        if (index > -1) {
          state.conversations[index] = action.payload;
        }
        if (state.currentConversation?.id === action.payload.id) {
          state.currentConversation = action.payload;
        }
      });

    // Delete conversation
    builder
      .addCase(deleteConversation.fulfilled, (state, action: PayloadAction<string>) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.messagesLoading = false;
        const incoming = Array.isArray(action.payload) ? action.payload : [];
        if (!Array.isArray(state.messages)) {
          state.messages = [];
        }
        state.messages = mergeMessages(state.messages, incoming as Message[]);
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        if (!Array.isArray(state.messages)) state.messages = [];
        state.messages.push(action.payload);
      });

    // Process message
    builder
      .addCase(processMessage.pending, (state) => {
        state.processingMessage = true;
        state.error = null;
      })
      .addCase(processMessage.fulfilled, (state, action) => {
        state.processingMessage = false;
        // Agent responses are added via WebSocket in real-time
        // But we can add them here as a fallback
        const incoming = action.payload.data;
        if (Array.isArray(incoming)) {
          if (!Array.isArray(state.messages)) {
            state.messages = [];
          }
          state.messages = mergeMessages(state.messages, incoming as Message[]);
        } else if (incoming) {
          // Defensive: only push when state.messages is an array
          if (!Array.isArray(state.messages)) {
            state.messages = [];
          }
          state.messages.push(incoming as Message);
        }
      })
      .addCase(processMessage.rejected, (state, action) => {
        state.processingMessage = false;
        state.error = action.payload as string;
      });

    // Step conversation
    builder
      .addCase(stepConversation.fulfilled, (state, action) => {
        if (action.payload?.message) {
          if (!Array.isArray(state.messages)) state.messages = [];
          state.messages = mergeMessages(state.messages, [action.payload.message as any]);
        }
        if (state.currentConversation) {
          state.currentConversation.currentSpeaker = action.payload?.speaker || null;
          state.currentConversation.turnIndex = (state.currentConversation.turnIndex || 0) + 1;
        }
      })
      .addCase(stepConversation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentConversation,
  clearCurrentConversation,
  addMessage,
  addTypingAgent,
  removeTypingAgent,
  clearTypingAgents,
  setStreamingChunk,
  clearStreamingChunk,
  upsertStreamingMessage,
  finalizeStreamingMessage,
  clearError,
} = conversationSlice.actions;

export default conversationSlice.reducer;
