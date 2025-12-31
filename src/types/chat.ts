export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface Message {
  id: string;
  personaId: string;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  isTyping?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url?: string;
}
