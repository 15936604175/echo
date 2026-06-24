import type { Message } from '@/types';
import { VrmAvatar } from '@/components/avatar/VrmAvatar';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';

interface ChatPanelProps {
  side: 'sender' | 'receiver';
  userName: string;
  avatarName: string;
  modelUrl: string;
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
  sendLabel?: string;
}

export function ChatPanel({
  side,
  userName,
  avatarName,
  modelUrl,
  messages,
  isActive,
  isLoading,
  showEndButton,
  showSendButton,
  isThinking,
  placeholder,
  sendLabel,
  onSend,
  onEnd,
  children,
}: ChatPanelProps) {
  const activeMessages = messages.filter((m) => m.role !== 'system').slice(-3);

  return (
    <div className={`chat-panel chat-panel-${side}`}>
      <div className="comic-stage">
        <VrmAvatar isActive={isActive && !isLoading} isThinking={isThinking} modelUrl={modelUrl} />

        <div className="comic-bubbles">
          {children}
          {isLoading && (
            <div className="comic-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
          {activeMessages.map((msg, i) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              userName={userName}
              avatarName={avatarName}
              index={i}
              total={activeMessages.length}
            />
          ))}
        </div>
      </div>

      <ChatInput
        disabled={!isActive || isLoading}
        isLoading={isLoading}
        showEndButton={showEndButton}
        showSendButton={showSendButton}
        sendLabel={sendLabel}
        onSend={onSend}
        onEnd={onEnd}
        placeholder={placeholder}
      />
    </div>
  );
}
