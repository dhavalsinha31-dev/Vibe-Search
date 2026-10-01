import { useState } from 'react'
import './App.css'
import moviesData from './data/movies.json'
import { searchMoviesWithGemini } from './services/gemini.js'

function App() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)

  // Flag indicating if we've searched yet
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    setResults([])

    try {
      const geminiMatches = await searchMoviesWithGemini(query);

      const matchingMovies = geminiMatches.map(match => {
        const movieDetails = moviesData.find(m => m.id === match.id);
        return {
          ...movieDetails,
          explanation: match.explanation
        }
      }).filter(m => m.id !== undefined); // Ensure we don't return malformed IDs

      setResults(matchingMovies);
    } catch (err) {
      setError(err.message || "Something went wrong processing your request.")
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1 className="logo">StreamFlix</h1>
        <p className="subtitle">
          Describe the exact vibe you're in the mood for, and our AI will find the perfect movies.
        </p>
      </header>

      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          className="magic-search-input"
          placeholder="e.g. A dystopian sci-fi with mind-bending concepts but no gore..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading || !query.trim()}>
          {loading ? 'Scanning...' : 'Vibe Search'}
        </button>
      </form>

      <main>
        {loading && (
          <div className="results-grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="movie-card">
                <div className="poster-placeholder skeleton"></div>
                <div className="movie-info">
                  <div className="skeleton skeleton-text" style={{ height: '1.5rem', width: '70%' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                  <div className="skeleton skeleton-text" style={{ marginTop: 'auto', height: '3rem' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="state-container">
            <div className="state-icon">⚠️</div>
            <h2>Oops!</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="state-container">
            <div className="state-icon">👻</div>
            <h2>No exact matches</h2>
            <p>We couldn't quite find that specific vibe. Try broadening your terms or asking for something else!</p>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="state-container">
            <div className="state-icon">🍿</div>
            <h2>What are you in the mood for?</h2>
            <p>Try searching "fast-paced action" or "heartwarming romance that won't make me cry."</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="results-grid">
            {results.map(movie => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img src={movie.poster_url} alt={`${movie.title} poster`} />
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span>{movie.release_year}</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                    <span className="movie-rating">{movie.rating}</span>
                  </div>
                  <p className="why-this-badge">
                    ✨ {movie.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
