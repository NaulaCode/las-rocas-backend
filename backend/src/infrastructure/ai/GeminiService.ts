import https from 'https';
import { IAiService, ChatOptions, ChatResult, FunctionCall } from '../../domain/ports/IAiService';
import { logger } from '../../shared/logger/logger';

const TEXT_EMBEDDING_MODEL = 'text-embedding-004';
const CHAT_MODEL = 'gemini-2.5-flash';
const API_BASE = 'generativelanguage.googleapis.com';
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class GeminiService implements IAiService {
  constructor(private apiKey: string) {}

  async ask(prompt: string): Promise<string> {
    const result = await this.chat({ systemPrompt: '', messages: [{ role: 'user', content: prompt }] });
    return result.text || '';
  }

  async chat(options: ChatOptions): Promise<ChatResult> {
    const body = this.buildRequestBody(options);
    const data = await this.postRequest(`/v1beta/models/${CHAT_MODEL}:generateContent`, body);
    return this.parseResponse(data, options.tools ? options.tools.map(t => t.name) : []);
  }

  async chatStream(
    options: ChatOptions & { onToken: (token: string) => void; onFunctionCall?: (call: FunctionCall) => void; onStreamEnd?: () => void }
  ): Promise<void> {
    const body = this.buildRequestBody(options);
    const url = `/v1beta/models/${CHAT_MODEL}:streamGenerateContent?alt=sse`;

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: API_BASE,
          path: url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
          timeout: 30000,
        },
        (res) => {
          let buffer = '';
          res.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const parts = buffer.split('\n');
            buffer = parts.pop() || '';
            for (const line of parts) {
              if (!line.startsWith('data: ')) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                const candidate = parsed?.candidates?.[0];
                if (!candidate) continue;

                if (candidate.finishReason === 'SAFETY') {
                  logger.warn('Gemini blocked response for safety');
                  continue;
                }

                const part = candidate?.content?.parts?.[0];
                if (!part) continue;

                if (part.text) {
                  options.onToken(part.text);
                }

                if (part.functionCall && options.onFunctionCall) {
                  const fnCall: FunctionCall = {
                    name: part.functionCall.name,
                    args: part.functionCall.args || {},
                  };
                  options.onFunctionCall(fnCall);
                }
              } catch (e) {
                // ignore parse errors in streaming chunks
              }
            }
          });
          res.on('end', () => {
            options.onStreamEnd?.();
            resolve();
          });
        }
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout en conexión con Gemini')); });
      req.write(JSON.stringify(body));
      req.end();
    });
  }

  async embed(text: string): Promise<number[]> {
    const body = { model: `models/${TEXT_EMBEDDING_MODEL}`, content: { parts: [{ text }] } };
    const data = await this.postRequest(`/v1beta/models/${TEXT_EMBEDDING_MODEL}:embedContent`, body);
    return data?.embedding?.values || [];
  }

  private buildRequestBody(options: ChatOptions): any {
    const contents = options.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const body: any = {
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    };

    if (options.systemPrompt) {
      body.systemInstruction = { parts: [{ text: options.systemPrompt }] };
    }

    if (options.tools && options.tools.length > 0) {
      body.tools = [{ functionDeclarations: options.tools }];
    }

    return body;
  }

  private async postRequest(path: string, body: any, retries: number = MAX_RETRIES): Promise<any> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this._postRequest(path, body);
      } catch (e) {
        const msg = (e as Error).message;
        const isQuota = msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED');
        const isRateLimit = msg.includes('rate_limit') || msg.includes('Too Many Requests');

        if ((isQuota || isRateLimit) && attempt < MAX_RETRIES) {
          const wait = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
          logger.warn(`Gemini rate limited (attempt ${attempt}/${MAX_RETRIES}), retrying in ${Math.round(wait)}ms`);
          await sleep(wait);
          continue;
        }
        throw e;
      }
    }
    throw new Error('Max retries exceeded');
  }

  private _postRequest(path: string, body: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: API_BASE,
          path,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
          timeout: 30000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: string) => (data += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed?.error) {
                logger.error(`Gemini API error [${parsed.error.code}]: ${parsed.error.message}`);
                reject(new Error(parsed.error.message));
                return;
              }
              resolve(parsed);
            } catch (e) {
              reject(new Error(`Error al parsear respuesta de Gemini: ${(e as Error).message}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout en conexión con Gemini')); });
      req.write(JSON.stringify(body));
      req.end();
    });
  }

  private parseResponse(data: any, toolNames: string[]): ChatResult {
    const candidate = data?.candidates?.[0];
    if (!candidate) {
      if (data?.promptFeedback?.blockReason) {
        return { text: 'Lo siento, no puedo responder esa consulta por políticas de seguridad.' };
      }
      return { text: '' };
    }

    const part = candidate?.content?.parts?.[0];
    if (!part) return { text: '' };

    if (part.text) return { text: part.text };

    if (part.functionCall) {
      return {
        functionCalls: [{
          name: part.functionCall.name,
          args: part.functionCall.args || {},
        }],
      };
    }

    return { text: '' };
  }
}
