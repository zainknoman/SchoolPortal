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

export interface SectionSummary {
  id: string;
  name: string;
  className: string;
  campusName: string;
}

export interface StudentSummary {
  id: string;
  name: string;
  grNumber: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new ApiError(await parseErrorMessage(res), res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return asJson<LoginResponse>(res);
  },

  async me(accessToken: string): Promise<{ id: string; role: string }> {
    const res = await fetch(`${API_BASE_URL}/api/v1/me`, { headers: authHeaders(accessToken) });
    return asJson(res);
  },

  async listSections(accessToken: string): Promise<SectionSummary[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/sections`, { headers: authHeaders(accessToken) });
    return asJson(res);
  },

  async sectionStudents(accessToken: string, sectionId: string): Promise<StudentSummary[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/sections/${sectionId}/students`, {
      headers: authHeaders(accessToken),
    });
    return asJson(res);
  },

  async markAttendance(
    accessToken: string,
    payload: { studentId: string; date: string; status: AttendanceStatus },
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(accessToken) },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new ApiError(await parseErrorMessage(res), res.status);
    }
  },
};
