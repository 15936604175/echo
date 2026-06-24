import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useConversation } from '@/hooks/useConversation';
import { hasLLMConfig } from '@/config/llm';
import { AppHeader } from '@/components/layout/AppHeader';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { StyleSelector } from '@/components/sender/StyleSelector';
import { ShareModal } from '@/components/chat/ShareModal';
import { getDemoSenderScript, getDemoReceiverScript, demoStepToMessage } from '@/data/demoScript';
import type { Personality } from '@/types';

const SENDER_MODEL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json';
const RECEIVER_MODEL = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';

export default function App() {
  const {
    phase,
    sender,
    receiver,
    isLoading,
    setPhase,
    setPersonality,
    setCustomPersonalityDesc,
    setShareInfo,
    addMessage,
    setConversationSummary,
    reset,
  } = useAppStore();

  const { sendSenderMessage, sendReceiverMessage, generateSummary, startReceiverConversation } = useConversation();
  const [isGenerating, setIsGenerating] = useState(false);
  const startedRef = useRef(false);
  const isDemo = !hasLLMConfig();

  const demoStepIdx = useRef(0);
  const demoRecvIdx = useRef(0);
  const [demoStep, setDemoStep] = useState(0);
  const [demoRecvStep, setDemoRecvStep] = useState(0);
  const demoScript = useRef(getDemoSenderScript());
  const demoRecvScript = useRef(getDemoReceiverScript());

  const advanceDemo = useCallback((side: 'sender' | 'receiver') => {
    const script = side === 'sender' ? demoScript.current : demoRecvScript.current;
    const idxRef = side === 'sender' ? demoStepIdx : demoRecvIdx;
    const setter = side === 'sender' ? setDemoStep : setDemoRecvStep;
    const i = idxRef.current;

    const step = script[i];
    if (!step) return;

    const msg = demoStepToMessage(step, side);
    addMessage(side, msg);
    idxRef.current = i + 1;
    setter(i + 1);

    if (side === 'sender') {
      const next = script[i + 1];
      if (next && next.role === 'avatar') {
        setTimeout(() => {
          const avatarMsg = demoStepToMessage(next, side);
          addMessage(side, avatarMsg);
          idxRef.current = i + 2;
          setter(i + 2);
        }, 600);
      }
    }
  }, [addMessage]);

  useEffect(() => {
    if (phase === 'receiving' && !startedRef.current) {
      startedRef.current = true;
      if (isDemo) {
        advanceDemo('receiver');
      } else {
        startReceiverConversation();
      }
    }
    if (phase !== 'receiving') {
      startedRef.current = false;
    }
  }, [phase, isDemo, advanceDemo, startReceiverConversation]);

  const handleStyleConfirm = useCallback(
    (personality: Personality, customDesc: string) => {
      setPersonality(personality);
      setCustomPersonalityDesc(customDesc);
      setPhase('sending');
      if (isDemo) {
        setTimeout(() => advanceDemo('sender'), 400);
      }
    },
    [setPersonality, setCustomPersonalityDesc, setPhase, isDemo, advanceDemo]
  );

  const handleSenderSend = useCallback(
    (content: string) => {
      if (isDemo) {
        advanceDemo('sender');
      } else {
        sendSenderMessage(content);
      }
    },
    [isDemo, advanceDemo, sendSenderMessage]
  );

  const handleSenderEnd = useCallback(() => {
    setPhase('review');
  }, [setPhase]);

  const handleShare = useCallback(async () => {
    setIsGenerating(true);
    setShareInfo({ targetName: receiver.name, timestamp: Date.now() });

    if (isDemo) {
      setTimeout(() => {
        setConversationSummary('小美因为身体不舒服没吃晚饭，妈妈责备了她。小美感到委屈和后悔，希望妈妈能理解她的身体状况。');
        setIsGenerating(false);
        setPhase('receiving');
      }, 800);
    } else {
      await generateSummary();
      setIsGenerating(false);
      setPhase('receiving');
    }
  }, [receiver.name, setShareInfo, setConversationSummary, setPhase, isDemo, generateSummary]);

  const handleSkipShare = useCallback(() => setPhase('end'), [setPhase]);

  const handleReceiverSend = useCallback(
    (content: string) => {
      if (isDemo) {
        advanceDemo('receiver');
      } else {
        sendReceiverMessage(content);
      }
    },
    [isDemo, advanceDemo, sendReceiverMessage]
  );

  const senderThinking = isLoading && phase === 'sending';
  const receiverThinking = isLoading && phase === 'receiving';
  const senderEndVisible = isDemo
    ? phase === 'sending' && demoStep >= demoScript.current.length
    : phase === 'sending' && sender.messages.length > 0;

  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
        <div className="phones-container">
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
                  showEndButton={senderEndVisible}
                  showSendButton={phase === 'sending' && !senderEndVisible}
                  isThinking={senderThinking}
                  placeholder={isDemo ? '点击发送推进对话' : '说点什么...'}
                  onSend={handleSenderSend}
                  onEnd={handleSenderEnd}
                />
              )}
            </div>
            <div className="device-label">{sender.name} · 发送端</div>
          </div>

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
                showSendButton={phase === 'receiving' && demoRecvStep < demoRecvScript.current.length}
                isThinking={receiverThinking}
                placeholder={isDemo && phase === 'receiving' ? '点击发送推进对话' : phase === 'receiving' ? '说点什么...' : '等待小美分享对话...'}
                onSend={handleReceiverSend}
              />
            </div>
            <div className="device-label">{receiver.name} · 接收端</div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <span className={`status-dot ${phase}`} />
        <span className="status-text">
          {phase === 'idle' && (isDemo ? '演示模式' : '选择风格开始对话')}
          {phase === 'sending' && `${sender.name} 正在倾诉中`}
          {phase === 'review' && '对话已结束，确认是否分享'}
          {phase === 'receiving' && `${receiver.name} 正在接收中`}
          {phase === 'end' && '会话已结束'}
        </span>
      </footer>

      {phase === 'review' && (
        <ShareModal receiverName={receiver.name} onShare={handleShare} onSkip={handleSkipShare} isGenerating={isGenerating} />
      )}

      {phase === 'end' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">流程结束</h3>
            <p className="modal-desc">本次调解对话已完成。</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={reset}>重新开始</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
