const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const message = (body as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
  } catch {
    // response wasn't JSON — fall through to the generic message below
  }
  return 'Something went wrong. Please try again.';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface ChildSummary {
  id: string;
  name: string;
  grNumber: string;
  campus: string;
  class: string;
  section: string;
}

export const api = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      throw new ApiError(await parseErrorMessage(res), res.status);
    }

    return (await res.json()) as LoginResponse;
  },

  async me(accessToken: string): Promise<{ id: string; role: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new ApiError(await parseErrorMessage(res), res.status);
    }

    return (await res.json()) as { id: string; role: string };
  },
};
