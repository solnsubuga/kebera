/**
 * The one place the app talks to the API. Requests go to /api on the same origin: nginx (Docker) or the
 * Vite dev server passes them to FastAPI, so there is no CORS and no API URL baked into the build.
 */
export class ApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `Request failed (${status})`)
    this.status = status
    this.detail = detail
  }
}

type Json = Record<string, unknown> | unknown[]

async function request<T>(method: string, path: string, body?: Json, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    signal,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    let detail: unknown = res.statusText
    try {
      detail = ((await res.json()) as { detail?: unknown }).detail ?? detail
    } catch {
      // not JSON
    }
    throw new ApiError(res.status, detail)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body: Json) => request<T>('POST', path, body),
  patch: <T>(path: string, body: Json) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}

/** Query-string helper that drops empty values. */
export function qs(params: Record<string, string | number | undefined | null>) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  return entries.length ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}` : ''
}
