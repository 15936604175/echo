interface ShareModalProps {
  receiverName: string;
  onShare: () => void;
  onSkip: () => void;
  isGenerating: boolean;
}

export function ShareModal({ receiverName, onShare, onSkip, isGenerating }: ShareModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">对话已结束</h3>
        <p className="modal-desc">是否将本次对话内容分享给 <strong>{receiverName}</strong>？</p>
        <p className="modal-hint">
          分享后，你的数字人会向 {receiverName} 转述对话内容，帮助你们更好地沟通。
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onSkip}>
            不分享
          </button>
          <button
            className="btn btn-primary"
            onClick={onShare}
            disabled={isGenerating}
          >
            {isGenerating ? '正在生成摘要...' : '分享给 ' + receiverName}
          </button>
        </div>
      </div>
    </div>
  );
}
