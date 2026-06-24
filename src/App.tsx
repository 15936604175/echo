import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useConversation } from '@/hooks/useConversation';
import { hasLLMConfig } from '@/config/llm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { StyleSelector } from '@/components/sender/StyleSelector';
import { NotificationBanner } from '@/components/receiver/NotificationBanner';
import { ShareModal } from '@/components/chat/ShareModal';
import type { Personality } from '@/types';

const SENDER_MODEL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json';
const RECEIVER_MODEL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';

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

  const { sendSenderMessage, sendReceiverMessage, generateSummary, startReceiverConversation } = useConversation();
  const [isGenerating, setIsGenerating] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (phase === 'receiving' && !startedRef.current) {
      startedRef.current = true;
      startReceiverConversation();
    }
    if (phase !== 'receiving') {
      startedRef.current = false;
    }
  }, [phase, startReceiverConversation]);

  const handleStyleConfirm = useCallback(
    (personality: Personality, customDesc: string) => {
      if (!hasLLMConfig()) {
        alert('请先在设置中配置 API Key');
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

      <main className="app-main">
        <div className="phones-container">
          {/* 发送端手机 */}
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className="phone-screen">
              {phase === 'idle' ? (
                <StyleSelector onConfirm={handleStyleConfirm} />
              ) : (
                <ChatPanel
                  side="sender"
                  userName={sender.name}
                  avatarName="数字人"
                  modelUrl={SENDER_MODEL}
                  messages={sender.messages}
                  isActive={phase === 'sending'}
                  isLoading={isLoading}
                  showEndButton={phase === 'sending' && sender.messages.length > 0}
                  showSendButton={phase === 'sending'}
                  isThinking={senderThinking}
                  placeholder="说点什么..."
                  onSend={sendSenderMessage}
                  onEnd={handleSenderEnd}
                />
              )}
            </div>
            <div className="device-label">{sender.name} · 发送端</div>
          </div>

          {/* 接收端手机 */}
          <div className="phone-frame">
            <div className="phone-notch" />
            <div className={`phone-screen ${phase === 'receiving' ? '' : 'phone-locked'}`}>
              <ChatPanel
                side="receiver"
                userName={receiver.name}
                avatarName="数字人"
                modelUrl={RECEIVER_MODEL}
                messages={receiver.messages}
                isActive={phase === 'receiving'}
                isLoading={isLoading}
                showEndButton={false}
                showSendButton={phase === 'receiving'}
                isThinking={receiverThinking}
                placeholder={phase === 'receiving' ? '说点什么...' : '等待小美分享对话...'}
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
            <div className="device-label">{receiver.name} · 接收端</div>
          </div>
        </div>
      </main>

      {/* 底部状态栏 */}
      <footer className="app-footer">
        <span className={`status-dot ${phase}`} />
        <span className="status-text">
          {phase === 'idle' && '选择风格开始对话'}
          {phase === 'sending' && `${sender.name} 正在倾诉中 — ${sender.messages.length} 条消息`}
          {phase === 'review' && '对话已结束，确认是否分享'}
          {phase === 'receiving' && `${receiver.name} 正在接收中 — ${receiver.messages.length} 条消息`}
          {phase === 'end' && '会话已结束'}
        </span>
      </footer>

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
    </div>
  );
}
