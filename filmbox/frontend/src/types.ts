export type Film = {
  id: number
  title: string
  year: number
  genre: string
  rating: number
  votes: number
  duration: number
  director: string
  tags: string[]
  poster: string
  tone: string
}

export type Activity = {
  member: string
  action: string
  film: string
  date: string
  score: string
}

export type Dashboard = {
  filmCount: number
  noteCount: number
  watchCount: number
  memberCount: number
  favoriteGenre: string
  favoriteGenreNotes: number
  favoriteGenreAverage: number
  featured: Film | null
}
