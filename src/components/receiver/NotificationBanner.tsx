import type { ShareInfo } from '@/types';

interface NotificationBannerProps {
  shareInfo: ShareInfo;
  onDismiss: () => void;
}

export function NotificationBanner({ shareInfo, onDismiss }: NotificationBannerProps) {
  const time = new Date(shareInfo.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="notification-banner">
      <div className="notification-icon">🔔</div>
      <div className="notification-content">
        <p className="notification-text">
          {shareInfo.targetName} 分享了对话内容 {time}
        </p>
        <p className="notification-subtext">点击查看并回复</p>
      </div>
      <button className="notification-dismiss" onClick={onDismiss}>
        ✕
      </button>
    </div>
  );
}
