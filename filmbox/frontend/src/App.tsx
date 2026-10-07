import { useEffect, useState } from 'react'
import {
  Bell,
  BookmarkSimple,
  CaretDown,
  ChartLineUp,
  Check,
  FilmSlate,
  House,
  MagnifyingGlass,
  Play,
  Plus,
  Star,
  TrendUp,
  UsersThree,
  X,
} from '@phosphor-icons/react'
import { api } from './api'
import type { Activity, Dashboard, Film } from './types'
import './App.css'

const navItems = [
  { label: 'Accueil', icon: House },
  { label: 'Catalogue', icon: FilmSlate },
  { label: 'Membres', icon: UsersThree },
  { label: 'Tendances', icon: TrendUp },
]

function formatDuration(minutes: number) {
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}

function App() {
  const [activeNav, setActiveNav] = useState('Accueil')
  const [activeGenre, setActiveGenre] = useState('Tous')
  const [query, setQuery] = useState('')
  const [films, setFilms] = useState<Film[]>([])
  const [genres, setGenres] = useState<string[]>(['Tous'])
  const [activity, setActivity] = useState<Activity[]>([])
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [savedFilms, setSavedFilms] = useState<number[]>([])
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedFilm(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    Promise.all([api.dashboard(), api.genres(), api.activity(), api.selection(), api.films('', 'Tous')])
      .then(([nextDashboard, nextGenres, nextActivity, nextSelection, nextFilms]) => {
        setDashboard(nextDashboard)
        setGenres(nextGenres)
        setActivity(nextActivity)
        setSavedFilms(nextSelection)
        setFilms(nextFilms)
      })
      .catch(() => setError('La base FilmBox est indisponible.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (loading) return
    api.films(query, activeGenre)
      .then(setFilms)
      .catch(() => setError('Le catalogue ne répond pas.'))
  }, [activeGenre, query, loading])

  const scrollTo = (selector: string, label: string) => {
    setActiveNav(label)
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const featuredFilm = dashboard?.featured ?? films[0]

  const toggleSaved = async (filmId: number) => {
    const selected = !savedFilms.includes(filmId)
    setSavedFilms((current) => selected ? [...current, filmId] : current.filter((id) => id !== filmId))
    try {
      await api.toggleSelection(filmId, selected)
      setNotice(selected ? 'Ajouté à votre sélection' : 'Retiré de votre sélection')
    } catch {
      setSavedFilms((current) => selected ? current.filter((id) => id !== filmId) : [...current, filmId])
      setNotice('Impossible de modifier votre sélection')
    }
    window.setTimeout(() => setNotice(''), 2200)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><FilmSlate size={22} weight="fill" /></div>
          <span>filmbox</span>
        </div>
        <div className="workspace-switcher">
          <span className="workspace-dot" />
          <span>Le cercle cinéma</span>
          <CaretDown size={14} />
        </div>
        <nav className="main-nav" aria-label="Navigation principale">
          <p className="nav-label">Explorer</p>
          {navItems.map(({ label, icon: Icon }) => (
            <button className={`nav-item ${activeNav === label ? 'active' : ''}`} key={label} onClick={() => scrollTo(label === 'Accueil' ? '.intro-row' : label === 'Catalogue' ? '.catalogue-toolbar' : label === 'Membres' ? '.activity-panel' : '.trend-panel', label)} aria-current={activeNav === label ? 'page' : undefined}>
              <Icon size={19} weight={activeNav === label ? 'fill' : 'regular'} />
              <span>{label}</span>
              {label === 'Tendances' && <span className="nav-pulse" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-rule" />
        <nav className="main-nav" aria-label="Votre espace">
          <p className="nav-label">Votre espace</p>
          <button className="nav-item" onClick={() => scrollTo('.catalogue-grid', 'Ma sélection')}><BookmarkSimple size={19} /><span>Ma sélection</span><span className="nav-count">{savedFilms.length}</span></button>
          <button className="nav-item" onClick={() => scrollTo('.activity-panel', 'Mon activité')}><ChartLineUp size={19} /><span>Mon activité</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="mini-avatar">C9</div>
          <div><strong>cinephile_92</strong><span>Profil membre</span></div>
          <CaretDown size={15} className="footer-caret" />
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark"><FilmSlate size={19} weight="fill" /></div><span>filmbox</span></div>
          <div className="breadcrumb"><span>Le cercle cinéma</span><span className="breadcrumb-slash">/</span><strong>{activeNav}</strong></div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => setNotice('Aucune nouvelle notification')}><Bell size={19} /><span className="notification-dot" /></button>
            <div className="profile-chip"><div className="mini-avatar">C9</div><span>cinephile_92</span><CaretDown size={13} /></div>
          </div>
        </header>

        <div className="page-wrap">
          {error && <div className="api-error" role="alert">{error} <button onClick={() => window.location.reload()}>Réessayer</button></div>}
          <section className="intro-row">
            <div>
              <p className="eyebrow">MARDI 06 OCTOBRE 2026</p>
              <h1>Votre salle,<br /><em>vos histoires.</em></h1>
            </div>
            <p className="intro-copy">Un regard calme sur ce que le cercle regarde, note et partage.</p>
          </section>

          <section className="hero-feature" aria-label="Film à l'affiche">
            <div className="hero-art" style={{ backgroundImage: featuredFilm?.poster ? `url(${featuredFilm.poster})` : undefined }}><span>{featuredFilm?.title ?? 'FilmBox'}</span><small>{featuredFilm ? `${featuredFilm.year} / ${formatDuration(featuredFilm.duration)}` : 'Chargement'}</small></div>
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="hero-kicker"><span className="status-dot" /> À l’affiche cette semaine</div>
              <h2>{featuredFilm?.title ?? 'Chargement…'}</h2>
              <p className="hero-meta">{featuredFilm?.director ?? 'Catalogue FilmBox'} <span>•</span> {featuredFilm?.year ?? '—'} <span>•</span> {featuredFilm ? formatDuration(featuredFilm.duration) : '—'}</p>
              <p className="hero-description">Dans les rêves, les règles changent. Un film qui continue de se déplier longtemps après le générique.</p>
              <div className="hero-actions">
                <button className="primary-button" onClick={() => featuredFilm && setSelectedFilm(featuredFilm)} disabled={!featuredFilm}><Play size={17} weight="fill" /> Voir la fiche</button>
                <button className="ghost-button" onClick={() => featuredFilm && toggleSaved(featuredFilm.id)} disabled={!featuredFilm}>{featuredFilm && savedFilms.includes(featuredFilm.id) ? <Check size={17} /> : <Plus size={17} />} {featuredFilm && savedFilms.includes(featuredFilm.id) ? 'Dans la sélection' : 'Ajouter à ma sélection'}</button>
              </div>
            </div>
            <div className="hero-rating"><Star size={17} weight="fill" /><strong>{featuredFilm?.rating.toFixed(2) ?? '—'}</strong><span>sur 5</span></div>
          </section>

          <section className="metrics-grid" aria-label="Statistiques FilmBox">
            <div className="metric"><span className="metric-label">Films au catalogue</span><strong>{dashboard?.filmCount ?? '—'}</strong><span className="metric-change positive">dans votre catalogue</span></div>
            <div className="metric"><span className="metric-label">Notes du cercle</span><strong>{dashboard?.noteCount ?? '—'}</strong><span className="metric-change positive">par {dashboard?.memberCount ?? '—'} membres</span></div>
            <div className="metric"><span className="metric-label">Visionnages</span><strong>{dashboard?.watchCount ?? '—'}</strong><span className="metric-change neutral">dans le journal</span></div>
            <div className="metric metric-accent"><span className="metric-label">Genre favori</span><strong>{dashboard?.favoriteGenre ?? '—'}</strong><span className="metric-change accent-text">{dashboard ? `${dashboard.favoriteGenreNotes} notes • ${dashboard.favoriteGenreAverage.toFixed(2)} moy.` : '—'}</span></div>
          </section>

          <section className="section-heading">
            <div><h2>À revoir, à découvrir.</h2></div>
            <button className="text-button" onClick={() => scrollTo('.catalogue-toolbar', 'Catalogue')}>Voir tout <span>↗</span></button>
          </section>

          <section className="catalogue-toolbar">
            <label className="search-field"><MagnifyingGlass size={18} /><input aria-label="Rechercher un film" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Titre, réalisateur, tag..." /><kbd>⌘ K</kbd></label>
            <div className="genre-filter" role="group" aria-label="Filtrer par genre">
              {genres.map((genre) => <button key={genre} className={activeGenre === genre ? 'selected' : ''} onClick={() => setActiveGenre(genre)} aria-pressed={activeGenre === genre}>{genre}</button>)}
            </div>
          </section>

          <section className="catalogue-grid">
            {loading && <div className="empty-state"><strong>Chargement du catalogue…</strong><span>Lecture des films FilmBox.</span></div>}
            {!loading && films.map((film) => <FilmCard key={film.id} film={film} saved={savedFilms.includes(film.id)} onSave={() => toggleSaved(film.id)} onOpen={() => setSelectedFilm(film)} />)}
            {!loading && films.length === 0 && <div className="empty-state"><MagnifyingGlass size={26} /><strong>Aucun film trouvé</strong><span>Essayez un autre titre ou un autre genre.</span></div>}
          </section>

          <section className="bottom-grid">
            <div className="activity-panel">
              <div className="panel-heading"><div><h2>Activité récente</h2></div><button className="icon-button subtle" aria-label="Revenir aux mouvements" onClick={() => scrollTo('.activity-panel', 'Mon activité')}><span>↗</span></button></div>
              <div className="activity-list">{activity.map((item) => <div className="activity-item" key={`${item.member}-${item.film}`}><div className="activity-avatar">{item.member.slice(0, 2).toUpperCase()}</div><p><strong>{item.member}</strong> {item.action} <b>{item.film}</b><span>{item.date}</span></p>{item.score !== '—' && <span className="activity-score"><Star size={12} weight="fill" /> {item.score}</span>}</div>)}</div>
            </div>
            <div className="trend-panel"><div className="panel-heading"><div><h2>Les mieux notés</h2></div><TrendUp size={22} className="trend-icon" /></div><div className="trend-list">{[...films].sort((first, second) => second.rating - first.rating).slice(0, 3).map((film, index) => <div className="trend-item" key={film.id}><span className="trend-rank">0{index + 1}</span><div><strong>{film.title}</strong><span>{film.votes} notes · {film.genre}</span></div><b><Star size={12} weight="fill" /> {film.rating.toFixed(2)}</b></div>)}</div></div>
          </section>
        </div>
      </main>

      {selectedFilm && <div className="modal-backdrop" role="presentation" onClick={() => setSelectedFilm(null)}><aside className="film-drawer" role="dialog" aria-modal="true" aria-label={`Fiche de ${selectedFilm.title}`} onClick={(event) => event.stopPropagation()}><button className="drawer-close icon-button" onClick={() => setSelectedFilm(null)} aria-label="Fermer"><X size={20} /></button><div className={`drawer-poster ${selectedFilm.tone}`} style={{ backgroundImage: `url(${selectedFilm.poster})` }}><strong>{selectedFilm.title}</strong><span>{selectedFilm.year}</span></div><div className="drawer-body"><div className="drawer-title-row"><div><h2>{selectedFilm.title}</h2></div><div className="drawer-score"><Star size={16} weight="fill" />{selectedFilm.rating.toFixed(2)}</div></div><p className="drawer-meta">{selectedFilm.director} <span>•</span> {selectedFilm.year} <span>•</span> {formatDuration(selectedFilm.duration)}</p><p className="drawer-description">Un film du catalogue FilmBox, suivi par {selectedFilm.votes} membres du cercle. Retrouvez vos notes et vos tags dans la fiche enrichie.</p><div className="tag-row">{selectedFilm.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div><button className="primary-button full-button" onClick={() => toggleSaved(selectedFilm.id)}>{savedFilms.includes(selectedFilm.id) ? <Check size={17} /> : <Plus size={17} />} {savedFilms.includes(selectedFilm.id) ? 'Dans ma sélection' : 'Ajouter à ma sélection'}</button></div></aside></div>}
      {notice && <div className="toast"><Check size={16} weight="bold" />{notice}</div>}
    </div>
  )
}

function FilmCard({ film, saved, onSave, onOpen }: { film: Film; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="film-card"><button className={`poster ${film.tone}`} style={{ backgroundImage: `url(${film.poster})` }} onClick={onOpen} aria-label={`Ouvrir la fiche de ${film.title}`}><span className="poster-art-title">{film.title}</span><span className="poster-year">{film.year}</span><span className="poster-overlay"><Play size={22} weight="fill" /></span></button><div className="film-card-body"><div className="film-card-title"><div><h3>{film.title}</h3><p>{film.director}</p></div><button className={`save-button ${saved ? 'saved' : ''}`} onClick={onSave} aria-label={saved ? `Retirer ${film.title} de la sélection` : `Ajouter ${film.title} à la sélection`}><BookmarkSimple size={18} weight={saved ? 'fill' : 'regular'} /></button></div><div className="film-card-meta"><span>{film.genre}</span><span className="film-rating"><Star size={13} weight="fill" />{film.rating.toFixed(2)}</span></div></div></article>
}

export default App
