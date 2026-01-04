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
    const { protocol, hostname, port } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    // If running Next dev on 8080/3001/etc, default API WS to 3000
    const defaultApiPort = '3000';
    const usePort = ['localhost', '127.0.0.1'].includes(hostname)
      ? defaultApiPort
      : port || '';
    const hostPort = usePort ? `${hostname}:${usePort}` : hostname;
    return `${wsProtocol}//${hostPort}`;
  }
  return 'http://localhost:3000';
};

const SOCKET_URL = deriveBaseUrl();
const SOCKET_PATH = process.env.NEXT_PUBLIC_WS_PATH || '/socket.io';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private currentNamespace: string | null = null;

  connect(): Socket {
    // Backend gateway namespace is /board
    const namespace = '/board';

    if (this.socket && this.isConnected && this.currentNamespace === namespace) {
      return this.socket;
    }

    const token = this.getToken();
    const url = `${SOCKET_URL}${namespace}`;
    this.socket = io(url, {
      auth: {
        token: token || '',
      },
      path: SOCKET_PATH,
      // Prefer polling first to avoid failing websocket upgrades through dev proxies; upgrade to ws if available
      transports: ['polling', 'websocket'],
      upgrade: true,
    });
    this.currentNamespace = namespace;

    console.info('[socket] connecting', { url, path: SOCKET_PATH, transports: ['polling', 'websocket'] });

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
      this.currentNamespace = null;
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

  onAgentMessageReceived(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_message_received', callback);
    }
  }

  onAgentTyping(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_typing', callback);
    }
  }

  onAgentTypingStart(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_typing_start', callback);
    }
  }

  onAgentTypingStop(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('agent_typing_stop', callback);
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

  getIsConnected(): boolean {
    return this.isConnected;
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
