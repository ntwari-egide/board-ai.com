// API Types based on backend documentation

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role?: {
    id: number;
    name: string;
  };
  status?: {
    id: number;
    name: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemPrompt?: string;
  color: string;
  icon: string;
  capabilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StructuredOutput {
  reasoning: string;
  confidence: number;
  suggestions: string[];
}

export interface Message {
  id: string;
  role: 'USER' | 'AGENT';
  content: string;
  agentType?: string;
  structuredOutput?: StructuredOutput;
  roundNumber?: number;
  conversation?: {
    id: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  activePersonas: string[];
  currentSpeaker?: string | null;
  turnIndex?: number;
  maxRounds: number;
  currentRound: number;
  user?: User;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title: string;
  activePersonas: string[];
  maxRounds?: number;
  currentSpeaker?: string;
  turnIndex?: number;
}

export interface UpdateConversationRequest {
  title?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  activePersonas?: string[];
  currentSpeaker?: string;
  turnIndex?: number;
  maxRounds?: number;
}

export interface CreateMessageRequest {
  content: string;
}

export interface ProcessMessageRequest {
  message: string;
}

export interface ProcessMessageResponse {
  success: boolean;
  data: Message[];
  count: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  publicUrl: string;
  message?: {
    id: string;
    content?: string;
  };
  createdAt: string;
}

export interface ConversationAnalytics {
  id: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  agentParticipation: Record<string, number>;
  conversation: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// WebSocket Events
export interface AgentTypingEvent {
  conversationId: string;
  agentType: string;
  agentName: string;
}

export interface AgentResponseEvent {
  conversationId: string;
  message: Message;
}

export interface RoundCompletedEvent {
  conversationId: string;
  roundNumber: number;
}

export interface StatusChangeEvent {
  conversationId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
}

export interface SummaryResponse {
  success: boolean;
  data: {
    summary: string;
  };
}
