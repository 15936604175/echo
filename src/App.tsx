import { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useConversation } from '@/hooks/useConversation';
import { hasLLMConfig } from '@/config/llm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { StyleSelector } from '@/components/sender/StyleSelector';
import { NotificationBanner } from '@/components/receiver/NotificationBanner';
import { ShareModal } from '@/components/chat/ShareModal';
import type { Personality } from '@/types';

export default function App() {
  const {
    phase,
    sender,
    receiver,
    shareInfo,
    isLoading,
    setPhase,
    setPersonality,
    setCustomPersonalityDesc,
    setShareInfo,
    reset,
  } = useAppStore();

  const { sendSenderMessage, sendReceiverMessage, generateSummary } = useConversation();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStyleConfirm = useCallback(
    (personality: Personality, customDesc: string) => {
      if (!hasLLMConfig()) {
        alert('请先在设置中配置 API Key（点击右上角齿轮图标）');
        return;
      }
      setPersonality(personality);
      setCustomPersonalityDesc(customDesc);
      setPhase('sending');
    },
    [setPersonality, setCustomPersonalityDesc, setPhase]
  );

  const handleSenderEnd = useCallback(() => {
    setPhase('review');
  }, [setPhase]);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    setShareInfo({
      targetName: receiver.name,
      timestamp: Date.now(),
    });
    await generateSummary();
    setIsGenerating(false);
    setPhase('receiving');
  }, [receiver.name, setShareInfo, generateSummary, setPhase]);

  const handleSkipShare = useCallback(() => {
    setPhase('end');
  }, [setPhase]);

  const senderThinking = isLoading && phase === 'sending';
  const receiverThinking = isLoading && phase === 'receiving';
  const showNotification = shareInfo && phase === 'receiving';

  return (
    <div className="app">
      <AppHeader />

      <main className={`app-main phase-${phase}`}>
        <div className="split-pane">
          <div className="pane pane-sender">
            {phase === 'idle' ? (
              <StyleSelector onConfirm={handleStyleConfirm} />
            ) : (
              <ChatPanel
                side="sender"
                userName={sender.name}
                avatarName="数字人"
                messages={sender.messages}
                isActive={phase === 'sending'}
                isLoading={isLoading}
                showEndButton={phase === 'sending' && sender.messages.length > 0}
                showSendButton={phase === 'sending'}
                isThinking={senderThinking}
                placeholder="输入你的想法..."
                onSend={sendSenderMessage}
                onEnd={handleSenderEnd}
              />
            )}
          </div>

          <div className={`pane pane-receiver ${phase === 'receiving' ? '' : 'pane-locked'}`}>
            <ChatPanel
              side="receiver"
              userName={receiver.name}
              avatarName="数字人"
              messages={receiver.messages}
              isActive={phase === 'receiving'}
              isLoading={isLoading}
              showEndButton={false}
              showSendButton={phase === 'receiving'}
              isThinking={receiverThinking}
              placeholder={phase === 'receiving' ? '输入你的想法...' : '等待发送端完成对话...'}
              onSend={sendReceiverMessage}
            >
              {showNotification && shareInfo && (
                <NotificationBanner
                  shareInfo={shareInfo}
                  onDismiss={() => {}}
                />
              )}
            </ChatPanel>
          </div>
        </div>
      </main>

      {phase === 'review' && (
        <ShareModal
          receiverName={receiver.name}
          onShare={handleShare}
          onSkip={handleSkipShare}
          isGenerating={isGenerating}
        />
      )}

      {phase === 'end' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">流程结束</h3>
            <p className="modal-desc">本次调解对话已完成。</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={reset}>
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <span className={`status-badge badge-${phase}`}>
          {phase === 'idle' && '等待开始'}
          {phase === 'sending' && `${sender.name} 正在倾诉中`}
          {phase === 'review' && '确认分享'}
          {phase === 'receiving' && `${receiver.name} 正在接收中`}
          {phase === 'end' && '会话已结束'}
        </span>
        <span>
          {sender.name}: {sender.messages.length} 条 | {receiver.name}: {receiver.messages.length} 条
        </span>
      </footer>
    </div>
  );
}
