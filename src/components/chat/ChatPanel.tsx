import type { Message } from '@/types';
import { VrmAvatar } from '@/components/avatar/VrmAvatar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';

interface ChatPanelProps {
  side: 'sender' | 'receiver';
  userName: string;
  avatarName: string;
  messages: Message[];
  isActive: boolean;
  isLoading: boolean;
  showEndButton: boolean;
  showSendButton: boolean;
  isThinking: boolean;
  placeholder?: string;
  onSend: (content: string) => void;
  onEnd?: () => void;
  children?: React.ReactNode;
}

export function ChatPanel({
  side,
  userName,
  avatarName,
  messages,
  isActive,
  isLoading,
  showEndButton,
  showSendButton,
  isThinking,
  placeholder,
  onSend,
  onEnd,
  children,
}: ChatPanelProps) {
  return (
    <div className={`chat-panel chat-panel-${side}`}>
      <div className="panel-header">
        <span className="panel-name">{userName}</span>
        <span className={`panel-status ${isActive ? 'status-active' : 'status-idle'}`}>
          {isActive ? '在线' : '等待中'}
        </span>
      </div>

      <VrmAvatar isActive={isActive && !isLoading} isThinking={isThinking} />

      <div className="chat-messages">
        {children}
        {messages.length === 0 && (
          <div className="chat-empty">
            {isActive ? '开始你的对话...' : '等待对方开始对话'}
          </div>
        )}
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            userName={userName}
            avatarName={avatarName}
          />
        ))}
        {isLoading && (
          <div className="chat-typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
      </div>

      <ChatInput
        disabled={!isActive || isLoading}
        isLoading={isLoading}
        showEndButton={showEndButton}
        showSendButton={showSendButton}
        onSend={onSend}
        onEnd={onEnd}
        placeholder={placeholder}
      />
    </div>
  );
}
