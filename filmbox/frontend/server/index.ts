import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = Number(process.env.API_PORT ?? 4000)
const memberPseudo = process.env.FILMBOX_MEMBER ?? 'cinephile_92'
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ database: 'filmbox', host: process.env.PGHOST ?? '/tmp' })

app.use(cors())
app.use(express.json())

const posterByTitle: Record<string, string> = {
  Inception: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=85',
  'The Dark Knight': 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=85',
  'Retour vers le futur': 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=85',
  Seven: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85',
  'Forrest Gump': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=85',
  'Les Évadés': 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=800&q=85',
}

function filmTone(genre: string) {
  return ({ 'Science-fiction': 'film-blue', Action: 'film-ink', Thriller: 'film-olive', Drame: 'film-gold' } as Record<string, string>)[genre] ?? 'film-sand'
}

function mapFilm(row: Record<string, unknown>) {
  const title = String(row.title)
  return {
    id: Number(row.id),
    title,
    year: Number(row.year),
    genre: String(row.genre),
    rating: Number(row.rating ?? 0),
    votes: Number(row.votes ?? 0),
    duration: Number(row.duration ?? 0),
    director: String(row.director ?? 'Réalisateur non renseigné'),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    poster: posterByTitle[title] ?? '',
    tone: filmTone(String(row.genre)),
  }
}

async function ensureSelectionTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS listes (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
      titre VARCHAR(100) NOT NULL,
      publique BOOLEAN NOT NULL DEFAULT false,
      creee_le DATE NOT NULL DEFAULT CURRENT_DATE
    );
    CREATE TABLE IF NOT EXISTS liste_films (
      liste_id INTEGER NOT NULL REFERENCES listes(id) ON DELETE CASCADE,
      film_id INTEGER NOT NULL REFERENCES films(id) ON DELETE CASCADE,
      position INTEGER NOT NULL CHECK (position > 0),
      PRIMARY KEY (liste_id, film_id)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS listes_utilisateur_titre_key
      ON listes (utilisateur_id, titre);
  `)
}

async function getMemberId() {
  const result = await pool.query('SELECT id FROM utilisateurs WHERE pseudo = $1', [memberPseudo])
  if (!result.rowCount) throw new Error(`Membre inconnu : ${memberPseudo}`)
  return result.rows[0].id as number
}

async function getSelectionListId(memberId: number) {
  const result = await pool.query(`
    INSERT INTO listes (utilisateur_id, titre, publique)
    VALUES ($1, 'Ma sélection', false)
    ON CONFLICT DO NOTHING
    RETURNING id
  `, [memberId])
  if (result.rowCount) return result.rows[0].id as number
  const existing = await pool.query('SELECT id FROM listes WHERE utilisateur_id = $1 AND titre = $2 ORDER BY id LIMIT 1', [memberId, 'Ma sélection'])
  return existing.rows[0].id as number
}

const filmStatsSql = `
  SELECT f.id, f.titre AS title, f.annee AS year, f.genre,
         COALESCE(ROUND(AVG(n.note), 2), 0) AS rating,
         COUNT(n.film_id)::INTEGER AS votes,
         COALESCE((f.details ->> 'duree')::INTEGER, 0) AS duration,
         COALESCE((
           SELECT STRING_AGG(p.nom, ', ' ORDER BY p.nom)
           FROM casting c JOIN personnes p ON p.id = c.personne_id
           WHERE c.film_id = f.id AND c.role = 'realisateur'
         ), 'Réalisateur non renseigné') AS director,
         COALESCE(f.details -> 'tags', '[]'::jsonb) AS tags
  FROM films f
  LEFT JOIN notes n ON n.film_id = f.id
`

app.get('/api/genres', async (_request, response) => {
  const result = await pool.query('SELECT DISTINCT genre FROM films ORDER BY genre')
  response.json(['Tous', ...result.rows.map((row) => row.genre)])
})

app.get('/api/films', async (request, response) => {
  const query = String(request.query.q ?? '').trim()
  const genre = String(request.query.genre ?? 'Tous')
  const values: string[] = []
  const filters: string[] = []
  if (query) {
    values.push(`%${query}%`)
    filters.push(`(f.titre ILIKE $${values.length} OR EXISTS (
      SELECT 1 FROM casting c JOIN personnes p ON p.id = c.personne_id
      WHERE c.film_id = f.id AND p.nom ILIKE $${values.length}
    ) OR EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(COALESCE(f.details -> 'tags', '[]'::jsonb)) AS tag
      WHERE tag ILIKE $${values.length}
    ))`)
  }
  if (genre !== 'Tous') {
    values.push(genre)
    filters.push(`f.genre = $${values.length}`)
  }
  const result = await pool.query(`${filmStatsSql}
    ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
    GROUP BY f.id
    ORDER BY rating DESC, f.annee DESC, f.titre`, values)
  response.json(result.rows.map(mapFilm))
})

app.get('/api/dashboard', async (_request, response) => {
  const [counts, favorite, featured] = await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*) FROM films)::INTEGER AS film_count,
      (SELECT COUNT(*) FROM notes)::INTEGER AS note_count,
      (SELECT COUNT(*) FROM journal)::INTEGER AS watch_count,
      (SELECT COUNT(*) FROM utilisateurs)::INTEGER AS member_count`),
    pool.query(`SELECT f.genre, COUNT(*)::INTEGER AS notes, ROUND(AVG(n.note), 2) AS average
      FROM notes n JOIN films f ON f.id = n.film_id
      GROUP BY f.genre ORDER BY COUNT(*) DESC, f.genre LIMIT 1`),
    pool.query(`${filmStatsSql} GROUP BY f.id ORDER BY rating DESC, votes DESC, f.titre LIMIT 1`),
  ])
  const count = counts.rows[0]
  const genre = favorite.rows[0]
  response.json({
    filmCount: count.film_count,
    noteCount: count.note_count,
    watchCount: count.watch_count,
    memberCount: count.member_count,
    favoriteGenre: genre?.genre ?? 'Non renseigné',
    favoriteGenreNotes: genre?.notes ?? 0,
    favoriteGenreAverage: Number(genre?.average ?? 0),
    featured: featured.rows[0] ? mapFilm(featured.rows[0]) : null,
  })
})

app.get('/api/activity', async (_request, response) => {
  const result = await pool.query(`
    SELECT u.pseudo AS member, 'a regardé' AS action, f.titre AS film,
           j.date_visionnage::TEXT AS date, '—' AS score
    FROM journal j
    JOIN utilisateurs u ON u.id = j.utilisateur_id
    JOIN films f ON f.id = j.film_id
    ORDER BY j.date_visionnage DESC, j.id DESC
    LIMIT 4
  `)
  response.json(result.rows)
})

app.get('/api/selection', async (_request, response) => {
  const memberId = await getMemberId()
  const listId = await getSelectionListId(memberId)
  const result = await pool.query('SELECT film_id FROM liste_films WHERE liste_id = $1 ORDER BY position, film_id', [listId])
  response.json(result.rows.map((row) => Number(row.film_id)))
})

app.post('/api/selection', async (request, response) => {
  const filmId = Number(request.body?.filmId)
  const selected = Boolean(request.body?.selected)
  if (!Number.isInteger(filmId)) return response.status(400).send('filmId invalide')
  const memberId = await getMemberId()
  const listId = await getSelectionListId(memberId)
  if (selected) {
    const position = await pool.query('SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM liste_films WHERE liste_id = $1', [listId])
    await pool.query('INSERT INTO liste_films (liste_id, film_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [listId, filmId, position.rows[0].next_position])
  } else {
    await pool.query('DELETE FROM liste_films WHERE liste_id = $1 AND film_id = $2', [listId, filmId])
  }
  response.json({ selected })
})

ensureSelectionTables()
  .then(() => app.listen(port, () => console.log(`FilmBox API listening on http://localhost:${port}`)))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
