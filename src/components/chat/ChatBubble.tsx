import type { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
  userName: string;
  avatarName?: string;
  index?: number;
  total?: number;
}

export function ChatBubble({
  message,
  userName,
  avatarName,
  index = 0,
  total = 1,
}: ChatBubbleProps) {
  const isUser = message.role === 'sender' || message.role === 'receiver';
  const isAvatar = message.role === 'avatar';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className={`comic-bubble comic-system ${message.isError ? 'bubble-error' : ''}`}>
        <div className="comic-bubble-text">{message.content}</div>
      </div>
    );
  }

  const side = isUser ? 'right' : 'left';
  const label = isUser ? userName : avatarName || '数字人';
  const isLatest = index === total - 1;

  return (
    <div
      className={`comic-bubble comic-${side} ${isLatest ? 'comic-latest' : 'comic-old'}`}
      style={{ zIndex: index + 1 }}
    >
      <div className="comic-bubble-label">{label}</div>
      <div className="comic-bubble-text">{message.content}</div>
      <div className={`comic-tail comic-tail-${side}`} />
    </div>
  );
}
