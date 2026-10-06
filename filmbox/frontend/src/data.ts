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

export const films: Film[] = [
  {
    id: 12,
    title: 'Inception',
    year: 2010,
    genre: 'Science-fiction',
    rating: 4.6,
    votes: 5,
    duration: 148,
    director: 'Christopher Nolan',
    tags: ['rêves', 'braquage'],
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=85',
    tone: 'film-blue',
  },
  {
    id: 20,
    title: 'The Dark Knight',
    year: 2008,
    genre: 'Action',
    rating: 4.5,
    votes: 5,
    duration: 152,
    director: 'Christopher Nolan',
    tags: ['super-héros', 'Gotham', 'culte'],
    poster: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=85',
    tone: 'film-ink',
  },
  {
    id: 28,
    title: 'Retour vers le futur',
    year: 1985,
    genre: 'Science-fiction',
    rating: 4.64,
    votes: 7,
    duration: 116,
    director: 'Robert Zemeckis',
    tags: ['voyage dans le temps', 'culte'],
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=85',
    tone: 'film-coral',
  },
  {
    id: 18,
    title: 'Seven',
    year: 1995,
    genre: 'Thriller',
    rating: 4.5,
    votes: 6,
    duration: 127,
    director: 'David Fincher',
    tags: ['enquête', 'tueur en série'],
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85',
    tone: 'film-olive',
  },
  {
    id: 7,
    title: 'Forrest Gump',
    year: 1994,
    genre: 'Drame',
    rating: 4.4,
    votes: 6,
    duration: 142,
    director: 'Robert Zemeckis',
    tags: ['destin', 'histoire vraie'],
    poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=85',
    tone: 'film-gold',
  },
  {
    id: 22,
    title: 'Les Évadés',
    year: 1994,
    genre: 'Drame',
    rating: 4.8,
    votes: 4,
    duration: 142,
    director: 'Frank Darabont',
    tags: ['prison', 'amitié', 'culte'],
    poster: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=800&q=85',
    tone: 'film-sand',
  },
]

export const activity = [
  { member: 'cinephile_92', action: 'a regardé', film: 'X-Men : Le Commencement', date: '2026-09-16', score: '—' },
  { member: 'darkroom', action: 'a regardé', film: 'The Dark Knight', date: '2026-09-12', score: '—' },
  { member: 'bobine', action: 'a regardé', film: 'Le Fabuleux Destin d’Amélie Poulain', date: '2026-09-12', score: '—' },
  { member: 'lea.reel', action: 'a noté', film: 'Inception', date: '2026-02-17', score: '5.0' },
]

export const genres = ['Tous', 'Science-fiction', 'Action', 'Thriller', 'Drame']
