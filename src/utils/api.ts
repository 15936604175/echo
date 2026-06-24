import type { LLMMessage, LLMResponse } from '@/types';
import { loadLLMConfig } from '@/config/llm';

class LLMError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

export async function callLLM(messages: LLMMessage[]): Promise<string> {
  const config = loadLLMConfig();

  if (!config.apiKey) {
    throw new LLMError('请先配置 API Key');
  }

  const body = JSON.stringify({
    model: config.model,
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(
        config.endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body,
        },
        30000
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new LLMError(
          getErrorMessage(response.status, errorText),
          response.status
        );
      }

      const data: LLMResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      if (content) return content;
      return '（我正在整理思绪，请稍等片刻后重新发送...）';
    } catch (err) {
      lastError = err as Error;
      if (err instanceof LLMError && err.statusCode === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = new LLMError('请求超时，请重试');
      }
      if (attempt === 0 && !(err instanceof LLMError && err.statusCode === 429)) {
        continue;
      }
    }
  }

  throw lastError || new LLMError('数字人暂时不在线，请稍后重试');
}

function getErrorMessage(status: number, body: string): string {
  switch (status) {
    case 400:
      return '请求参数错误，请检查配置';
    case 401:
      return 'API Key 无效，请检查';
    case 429:
      return '请求过于频繁，请稍后';
    case 500:
    case 502:
    case 503:
      return '服务暂时不可用，请稍后重试';
    default:
      return `请求失败 (${status}): ${body.slice(0, 100)}`;
  }
}

export async function callLLMWithHistory(
  systemPrompt: string,
  history: Array<{ role: 'sender' | 'receiver' | 'avatar'; content: string }>
): Promise<string> {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  for (const msg of history) {
    const role = msg.role === 'avatar' ? 'assistant' : 'user';
    messages.push({ role, content: msg.content });
  }

  return callLLM(messages);
}
