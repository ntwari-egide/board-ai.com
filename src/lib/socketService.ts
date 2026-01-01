import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import {
  AgentTypingEvent,
  AgentResponseEvent,
  RoundCompletedEvent,
  StatusChangeEvent,
} from '@/types/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = this.getToken();
    
    this.socket = io(`${SOCKET_URL}/board`, {
      extraHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  onAgentTyping(callback: (data: AgentTypingEvent) => void): void {
    if (this.socket) {
      this.socket.on('agent_typing', callback);
    }
  }

  onAgentResponse(callback: (data: AgentResponseEvent) => void): void {
    if (this.socket) {
      this.socket.on('agent_response', callback);
    }
  }

  onRoundCompleted(callback: (data: RoundCompletedEvent) => void): void {
    if (this.socket) {
      this.socket.on('round_completed', callback);
    }
  }

  onStatusChange(callback: (data: StatusChangeEvent) => void): void {
    if (this.socket) {
      this.socket.on('status_change', callback);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get('auth_token') || localStorage.getItem('auth_token') || null;
  }
}

export const socketService = new SocketService();
export default socketService;
