import { useEffect, useRef, useState } from 'react'
import './app.css'

interface Game {
  id: string
  title: string
  description: string
  entry: string
  thumbnail: string
  tags: string[]
  enabled: boolean
}

declare global {
  interface Window {
    arcade: {
      listGames: () => Promise<Game[]>
      getGameEntryPath: (entry: string) => Promise<string>
    }
  }
}

function App(): React.JSX.Element {
  const [games, setGames] = useState<Game[]>([])
  const [activeGamePath, setActiveGamePath] = useState<string | null>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)

  useEffect(() => {
    if (!window.arcade) return
    window.arcade.listGames().then((list) => {
      setGames(list.filter((g) => g.enabled))
    })
  }, [])

  async function launchGame(game: Game): Promise<void> {
    const fileUrl = await window.arcade.getGameEntryPath(game.entry)
    setActiveGamePath(fileUrl)
  }

  function exitGame(): void {
    setActiveGamePath(null)
  }

  return (
    <div className="arcade">
      {activeGamePath ? (
        <div className="game-view">
          <div className="game-bar">
            <button className="back-btn" onClick={exitGame}>
              ← 목록으로
            </button>
          </div>
          <webview ref={webviewRef} src={activeGamePath} className="game-webview" />
        </div>
      ) : (
        <div className="game-list">
          <h1 className="arcade-title">ARCADE</h1>
          <div className="game-grid">
            {games.map((game) => (
              <button key={game.id} className="game-card" onClick={() => launchGame(game)}>
                <div className="game-card-title">{game.title}</div>
                <p className="game-card-desc">{game.description}</p>
                <div className="game-card-tags">
                  {game.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
