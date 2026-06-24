import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  userName: string;
  avatarName?: string;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export function ChatBubble({ message, userName, avatarName }: ChatBubbleProps) {
  const isUser = message.role === 'sender' || message.role === 'receiver';
  const isAvatar = message.role === 'avatar';
  const isSystem = message.role === 'system';

  const displayName = isSystem
    ? '系统'
    : isAvatar
      ? avatarName || '数字人'
      : userName;

  const bubbleClass = isSystem
    ? 'bubble-system'
    : isAvatar
      ? 'bubble-avatar'
      : 'bubble-user';

  return (
    <div className={`chat-bubble ${bubbleClass} ${message.isError ? 'bubble-error' : ''}`}>
      <div className="bubble-meta">
        <span className="bubble-name">{displayName}</span>
        <span className="bubble-time">{formatTime(message.timestamp)}</span>
      </div>
      <div className="bubble-content">{message.content}</div>
    </div>
  );
}
