import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  disabled: boolean;
  isLoading: boolean;
  showEndButton: boolean;
  showSendButton: boolean;
  sendLabel?: string;
  onSend: (content: string) => void;
  onEnd?: () => void;
  placeholder?: string;
}

export function ChatInput({
  disabled,
  isLoading,
  showEndButton,
  showSendButton,
  sendLabel = '发送',
  onSend,
  onEnd,
  placeholder = '输入你的想法...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const content = input.trim();
    if (disabled || isLoading) return;
    if (!content && sendLabel !== '下一步') return;
    onSend(content);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <textarea
        ref={inputRef}
        className="chat-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={2}
      />
      <div className="chat-input-buttons">
        {showSendButton && (
          <button
            className={`btn ${sendLabel === '下一步' ? 'btn-next' : 'btn-send'}`}
            onClick={handleSend}
            disabled={disabled || isLoading || (sendLabel !== '下一步' && !input.trim())}
          >
            {isLoading ? '发送中...' : sendLabel}
          </button>
        )}
        {showEndButton && (
          <button className="btn btn-end" onClick={onEnd} disabled={disabled}>
            结束本次对话
          </button>
        )}
      </div>
    </div>
  );
}
