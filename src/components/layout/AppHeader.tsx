import { useState } from 'react';
import { loadLLMConfig, saveLLMConfig } from '@/config/llm';
import type { LLMConfig } from '@/types';

export function AppHeader() {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<LLMConfig>(loadLLMConfig);

  const handleSave = () => {
    saveLLMConfig(config);
    setShowSettings(false);
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Echo - 回声</h1>
        <div className="header-actions">
          <button
            className="btn btn-icon"
            onClick={() => setShowSettings(!showSettings)}
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <h3>API 设置</h3>
          <label>
            Endpoint
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="https://api.openai.com/v1/chat/completions"
            />
          </label>
          <label>
            API Key
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </label>
          <label>
            Model
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              placeholder="gpt-3.5-turbo"
            />
          </label>
          <div className="settings-actions">
            <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>
              取消
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      )}
    </>
  );
}
