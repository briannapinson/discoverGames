import { useState } from "react"
import "./App.css"

const API_KEY = "133e9feee1a245caaec9451412e5ae85"

function App() {
  const [game, setGame] = useState(null)
  const [banList, setBanList] = useState([])
  const [loading, setLoading] = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [loadingPhrase, setLoadingPhrase] = useState("")

const fetchGame = async () => {
  setLoadingPhrase(firstLoad ? "Armed and dangerous!" : "Again!")
  setFirstLoad(false)
  setLoading(true)
  let foundGame = null

  while (!foundGame) {
    const randomPage = Math.floor(Math.random() * 500) + 1
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20&page=${randomPage}`
    )
    const data = await res.json()

    foundGame = data.results.find(candidate => {
      const genres = candidate.genres.map(g => g.name)
      const platforms = candidate.parent_platforms.map(p => p.platform.name)
      const year = candidate.released?.slice(0, 4)
      const rating = Math.round(candidate.rating * 2) / 2

      return !banList.some(item =>
        genres.includes(item) ||
        platforms.includes(item) ||
        year === String(item) ||
        rating === item
      )
    })
  }

  foundGame.roundedRating = Math.round(foundGame.rating * 2) / 2
  setGame(foundGame)
  setLoading(false)
}

  const addToBan = (value) => {
    if (!banList.includes(value)) {
      setBanList([...banList, value])
    }
  }

  const removeFromBan = (value) => {
    setBanList(banList.filter(item => item !== value))
  }

  return (
    <div>
      <h1>🎮 Game Discovery</h1>
      <button onClick={fetchGame}>Discover</button>

      {loading && <p className="loading">{loadingPhrase}</p>}

      <div className="layout">
        <div className="game-card-area">
          {game && (
            <div className="game-card">
              <h2>{game.name}</h2>
              <img src={game.background_image} alt={game.name} width="400" />

              <p>Released: <span className="release-tag" onClick={() => addToBan(game.released.slice(0, 4))}>{game.released.slice(0, 4)}</span></p>

              <p>Rating: <span className="rating-tag" onClick={() => addToBan(game.roundedRating)}>{game.roundedRating}</span></p>

              <p>Genres: {game.genres.map((g, index) => (
                <span className="genre-tag" key={g.id} onClick={() => addToBan(g.name)}>
                  {g.name}{index < game.genres.length - 1 ? ", " : ""}
                </span>
              ))}</p>

              <p>Platforms: {game.parent_platforms.map((p, index) => (
                <span className="platform-tag" key={p.platform.id} onClick={() => addToBan(p.platform.name)}>
                  {p.platform.name}{index < game.parent_platforms.length - 1 ? ", " : ""}
                </span>
              ))}</p>
            </div>
          )}
        </div>

        <div className="ban-list">
          <h3>Ban List</h3>
          <p>Select an attribute on the game card to ban it!</p>
          {banList.map((item) => (
            <span key={item} className="ban-item" onClick={() => removeFromBan(item)}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
export default App