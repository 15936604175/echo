import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '@/store/useAppStore';
import { callLLMWithHistory } from '@/utils/api';
import { buildSenderSystemPrompt, buildReceiverSystemPrompt, buildSummaryPrompt } from '@/utils/prompt';
import type { Message } from '@/types';

export function useConversation() {
  const {
    phase,
    sender,
    receiver,
    setLoading,
    setError,
    addMessage,
    setConversationSummary,
    conversationSummary,
  } = useAppStore();

  const sendSenderMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || phase !== 'sending') return;

      const userMsg: Message = {
        id: uuidv4(),
        role: 'sender',
        content: content.trim(),
        timestamp: Date.now(),
      };
      addMessage('sender', userMsg);

      setLoading(true);
      try {
        const personality = sender.personality || 'warm';
        const systemPrompt = buildSenderSystemPrompt(
          personality,
          sender.customPersonalityDesc
        );

        const allMessages = sender.messages.concat(userMsg);
        const history = allMessages.map((m) => ({
          role: m.role as 'sender' | 'receiver' | 'avatar',
          content: m.content,
        }));

        const reply = await callLLMWithHistory(systemPrompt, history);

        const avatarMsg: Message = {
          id: uuidv4(),
          role: 'avatar',
          content: reply,
          timestamp: Date.now(),
        };
        addMessage('sender', avatarMsg);
      } catch (err: any) {
        const errorMsg: Message = {
          id: uuidv4(),
          role: 'system',
          content: err.message || '数字人暂时不在线',
          timestamp: Date.now(),
          isError: true,
        };
        addMessage('sender', errorMsg);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [phase, sender, addMessage, setLoading, setError]
  );

  const sendReceiverMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || phase !== 'receiving') return;

      const userMsg: Message = {
        id: uuidv4(),
        role: 'receiver',
        content: content.trim(),
        timestamp: Date.now(),
      };
      addMessage('receiver', userMsg);

      setLoading(true);
      try {
        const personality = sender.personality || 'warm';
        const systemPrompt = buildReceiverSystemPrompt(
          sender.name,
          receiver.name,
          conversationSummary,
          personality,
          sender.customPersonalityDesc
        );

        const allMessages = receiver.messages.concat(userMsg);
        const history = allMessages.map((m) => ({
          role: m.role as 'sender' | 'receiver' | 'avatar',
          content: m.content,
        }));

        const reply = await callLLMWithHistory(systemPrompt, history);

        const avatarMsg: Message = {
          id: uuidv4(),
          role: 'avatar',
          content: reply,
          timestamp: Date.now(),
        };
        addMessage('receiver', avatarMsg);
      } catch (err: any) {
        const errorMsg: Message = {
          id: uuidv4(),
          role: 'system',
          content: err.message || '数字人暂时不在线',
          timestamp: Date.now(),
          isError: true,
        };
        addMessage('receiver', errorMsg);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [phase, sender, receiver, conversationSummary, addMessage, setLoading, setError]
  );

  const generateSummary = useCallback(async (): Promise<string> => {
    const summaryPrompt = buildSummaryPrompt(sender.name);
    const history = sender.messages.map((m) => ({
      role: m.role as 'sender' | 'receiver' | 'avatar',
      content: m.content,
    }));

    try {
      const summary = await callLLMWithHistory(summaryPrompt, history);
      setConversationSummary(summary);
      return summary;
    } catch {
      const fallback = `${sender.name}表达了关于人际关系的困扰，希望对方能理解自己的感受。`;
      setConversationSummary(fallback);
      return fallback;
    }
  }, [sender, setConversationSummary]);

  const startReceiverConversation = useCallback(async () => {
    setLoading(true);
    try {
      const personality = sender.personality || 'warm';
      const systemPrompt = buildReceiverSystemPrompt(
        sender.name,
        receiver.name,
        conversationSummary,
        personality,
        sender.customPersonalityDesc
      );

      const reply = await callLLMWithHistory(systemPrompt, []);

      const avatarMsg: Message = {
        id: uuidv4(),
        role: 'avatar',
        content: reply,
        timestamp: Date.now(),
      };
      addMessage('receiver', avatarMsg);
    } catch (err: any) {
      const errorMsg: Message = {
        id: uuidv4(),
        role: 'system',
        content: err.message || '数字人暂时不在线',
        timestamp: Date.now(),
        isError: true,
      };
      addMessage('receiver', errorMsg);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sender, receiver, conversationSummary, setLoading, setError, addMessage]);

  return {
    sendSenderMessage,
    sendReceiverMessage,
    generateSummary,
    startReceiverConversation,
  };
}
