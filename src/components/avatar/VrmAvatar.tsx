import { useRef, useEffect } from 'react';
import { useVrmModel } from '@/hooks/useVrmModel';

interface VrmAvatarProps {
  isActive: boolean;
  isThinking: boolean;
  modelUrl: string;
}

export function VrmAvatar({ isActive, isThinking, modelUrl }: VrmAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { vrmState, error, setAnimation } = useVrmModel(containerRef, modelUrl);

  useEffect(() => {
    if (vrmState !== 'ready') return;
    if (isThinking) {
      setAnimation('thinking');
    } else if (isActive) {
      setAnimation('talking');
    } else {
      setAnimation('idle');
    }
  }, [isActive, isThinking, vrmState, setAnimation]);

  if (error) {
    return (
      <div className="vrm-container vrm-error">
        <div className="vrm-placeholder">数字人离线</div>
        <p className="vrm-error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="vrm-container">
      <div ref={containerRef} className="vrm-canvas" />
      {vrmState === 'loading' && (
        <div className="vrm-loading">加载中...</div>
      )}
    </div>
  );
}
