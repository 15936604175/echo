export type Phase = 'idle' | 'style-select' | 'sending' | 'review' | 'receiving' | 'end';

export type Personality = 'warm' | 'humorous' | 'neutral' | 'custom';

export interface Message {
  id: string;
  role: 'sender' | 'receiver' | 'avatar' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface SenderState {
  name: string;
  messages: Message[];
  personality: Personality | null;
  customPersonalityDesc: string;
}

export interface ReceiverState {
  name: string;
  messages: Message[];
}

export interface ShareInfo {
  targetName: string;
  timestamp: number;
}

export interface LLMConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface AppState {
  phase: Phase;
  sender: SenderState;
  receiver: ReceiverState;
  conversationSummary: string;
  shareInfo: ShareInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface AppActions {
  setPhase: (phase: Phase) => void;
  setPersonality: (personality: Personality) => void;
  setCustomPersonalityDesc: (desc: string) => void;
  addMessage: (side: 'sender' | 'receiver', message: Message) => void;
  setConversationSummary: (summary: string) => void;
  setShareInfo: (info: ShareInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSenderName: (name: string) => void;
  setReceiverName: (name: string) => void;
  reset: () => void;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
