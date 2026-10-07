import type { Activity, Dashboard, Film } from './types'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) throw new Error(await response.text())
  return response.json() as Promise<T>
}

export const api = {
  dashboard: () => request<Dashboard>('/api/dashboard'),
  genres: () => request<string[]>('/api/genres'),
  films: (query: string, genre: string) => request<Film[]>(`/api/films?q=${encodeURIComponent(query)}&genre=${encodeURIComponent(genre)}`),
  activity: () => request<Activity[]>('/api/activity'),
  selection: () => request<number[]>('/api/selection'),
  toggleSelection: (filmId: number, selected: boolean) => request<{ selected: boolean }>('/api/selection', {
    method: 'POST',
    body: JSON.stringify({ filmId, selected }),
  }),
}
