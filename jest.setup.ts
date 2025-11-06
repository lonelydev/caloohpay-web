import '@testing-library/jest-dom';

// Polyfill for Next.js API routes
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock Request and Response for Next.js server components
class MockRequest {
  url: string;
  method: string;
  headers: Map<string, string>;

  constructor(url: string, options: { method?: string; headers?: Record<string, string> } = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
  }
}

class MockResponse {
  status: number;
  statusText: string;
  headers: Map<string, string>;
  body: string | null;

  constructor(
    body: string | null,
    options: { status?: number; statusText?: string; headers?: Record<string, string> } = {}
  ) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || 'OK';
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  async json() {
    return JSON.parse(this.body || '{}');
  }

  async text() {
    return this.body || '';
  }
}

global.Request = MockRequest as unknown as typeof Request;
global.Response = MockResponse as unknown as typeof Response;
