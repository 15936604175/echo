import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  disabled: boolean;
  isLoading: boolean;
  showEndButton: boolean;
  showSendButton: boolean;
  onSend: (content: string) => void;
  onEnd?: () => void;
  placeholder?: string;
}

export function ChatInput({
  disabled,
  isLoading,
  showEndButton,
  showSendButton,
  onSend,
  onEnd,
  placeholder = '输入你的想法...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const content = input.trim();
    if (!content || disabled || isLoading) return;
    onSend(content);
    setInput('');
    inputRef.current?.focus();
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
            className="btn btn-send"
            onClick={handleSend}
            disabled={disabled || isLoading || !input.trim()}
          >
            {isLoading ? '发送中...' : '发送'}
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
