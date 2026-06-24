import type { LLMConfig } from '@/types';

const STORAGE_KEY = 'echo_llm_config';

const DEFAULT_CONFIG: LLMConfig = {
  endpoint: '/api/chat/completions',
  apiKey: 'sk-syMrRl2g5NydIYHN7s3NTV8sOvDk31DHTteMWMymVL1wKp84KDOuJTGvQgpu8pPl',
  model: 'deepseek-v4-flash',
};

export function loadLLMConfig(): LLMConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...DEFAULT_CONFIG };
}

export function saveLLMConfig(config: LLMConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function hasLLMConfig(): boolean {
  const config = loadLLMConfig();
  return config.apiKey.trim().length > 0;
}
