import { create } from 'zustand';
import type { AppState, AppActions, Phase, Personality, Message, ShareInfo } from '@/types';

const initialState: AppState = {
  phase: 'idle',
  sender: {
    name: '小明',
    messages: [],
    personality: null,
    customPersonalityDesc: '',
  },
  receiver: {
    name: '小明妈妈',
    messages: [],
  },
  conversationSummary: '',
  shareInfo: null,
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setPhase: (phase: Phase) =>
    set({ phase, error: null }),

  setPersonality: (personality: Personality) =>
    set((state) => ({
      sender: { ...state.sender, personality },
    })),

  setCustomPersonalityDesc: (desc: string) =>
    set((state) => ({
      sender: { ...state.sender, customPersonalityDesc: desc },
    })),

  addMessage: (side: 'sender' | 'receiver', message: Message) =>
    set((state) => ({
      [side]: {
        ...state[side],
        messages: [...state[side].messages, message],
      },
    })),

  setConversationSummary: (summary: string) =>
    set({ conversationSummary: summary }),

  setShareInfo: (info: ShareInfo | null) =>
    set({ shareInfo: info }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setError: (error: string | null) =>
    set({ error }),

  setSenderName: (name: string) =>
    set((state) => ({
      sender: { ...state.sender, name },
    })),

  setReceiverName: (name: string) =>
    set((state) => ({
      receiver: { ...state.receiver, name },
    })),

  reset: () => set(initialState),
}));
