import { useState } from 'react';
import type { Personality } from '@/types';

const STYLES: Array<{ value: Personality; label: string; desc: string; emoji: string }> = [
  { value: 'warm', label: '温暖知心', desc: '温柔共情，像心理咨询师', emoji: '🌸' },
  { value: 'humorous', label: '幽默诙谐', desc: '轻松化解尴尬，像老朋友', emoji: '😄' },
  { value: 'neutral', label: '理性中立', desc: '客观冷静，专业调解员', emoji: '⚖️' },
  { value: 'custom', label: '自定义', desc: '自己描述数字人风格', emoji: '✏️' },
];

interface StyleSelectorProps {
  onConfirm: (personality: Personality, customDesc: string) => void;
}

export function StyleSelector({ onConfirm }: StyleSelectorProps) {
  const [selected, setSelected] = useState<Personality>('warm');
  const [customDesc, setCustomDesc] = useState('');

  const handleConfirm = () => {
    if (selected === 'custom' && !customDesc.trim()) return;
    onConfirm(selected, customDesc.trim());
  };

  return (
    <div className="style-selector">
      <h2 className="style-title">选择数字人调解风格</h2>
      <div className="style-options">
        {STYLES.map((style) => (
          <label
            key={style.value}
            className={`style-option ${selected === style.value ? 'style-option-selected' : ''}`}
          >
            <input
              type="radio"
              name="personality"
              value={style.value}
              checked={selected === style.value}
              onChange={() => setSelected(style.value)}
            />
            <span className="style-emoji">{style.emoji}</span>
            <div className="style-info">
              <span className="style-label">{style.label}</span>
              <span className="style-desc">{style.desc}</span>
            </div>
          </label>
        ))}
      </div>
      {selected === 'custom' && (
        <textarea
          className="style-custom-input"
          value={customDesc}
          onChange={(e) => setCustomDesc(e.target.value)}
          placeholder="请描述你希望的数字人风格，例如：像一个知心大姐姐，说话温柔但有主见..."
          rows={3}
        />
      )}
      <button className="btn btn-primary" onClick={handleConfirm}>
        开始对话
      </button>
    </div>
  );
}
