import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';

import {
  AgentResponseEvent,
  RoundCompletedEvent,
  StatusChangeEvent,
} from '@/types/api';

const deriveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${host}`;
  }
  return 'http://localhost:3000';
};

const SOCKET_URL = deriveBaseUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_WS_PATH || '/socket.io';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Socket {
    // Backend gateway namespace is /board
    const namespace = '/board';

    if (this.socket && this.isConnected && this.socket.nsp === namespace) {
      return this.socket;
    }

    const token = this.getToken();
    this.socket = io(`${SOCKET_URL}${namespace}`, {
      auth: {
        token: token || '',
      },
      path: SOCKET_PATH,
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
      console.warn('WebSocket connection error:', error?.message || error);
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

  // Join/leave are not needed when using per-conversation namespace; kept for compatibility
  joinConversation(conversationId: string, userId?: string): void {
    if (this.socket) {
      this.socket.emit('join_conversation', {
        conversationId,
        userId: userId || 'anon',
      });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Match backend.md WebSocket events
  onAgentStream(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_stream', callback);
    }
  }

  onAgentMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_response', callback);
    }
  }

  onAgentTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_typing', callback);
    }
  }

  onMetricUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('METRIC_UPDATE', callback);
    }
  }

  onSessionComplete(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('session_complete', callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('ERROR', callback);
    }
  }

  // Legacy event handlers for backward compatibility
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
    return (
      Cookies.get('auth_token') || localStorage.getItem('auth_token') || null
    );
  }
}

export const socketService = new SocketService();
export default socketService;
