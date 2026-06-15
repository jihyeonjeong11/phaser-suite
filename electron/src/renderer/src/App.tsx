import React, { useState, useEffect, useRef } from 'react'
import './App.css'

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

export default function App() {
  const [games, setGames] = useState<Game[]>([])
  const [activeGamePath, setActiveGamePath] = useState<string | null>(null)
  const webviewRef = useRef<Electron.WebviewTag | null>(null)

  useEffect(() => {
    if (!window.arcade) return
    window.arcade.listGames().then((list) => {
      setGames(list.filter((g) => g.enabled))
    })
  }, [])

  async function launchGame(game: Game) {
    const path = await window.arcade.getGameEntryPath(game.entry)
    setActiveGamePath(`file://${path}`)
  }

  function exitGame() {
    setActiveGamePath(null)
  }

  return (
    <div className="arcade">
      {activeGamePath ? (
        <div className="game-view">
          <div className="game-bar">
            <button className="back-btn" onClick={exitGame}>← 목록으로</button>
          </div>
          <webview
            ref={webviewRef}
            src={activeGamePath}
            className="game-webview"
          />
        </div>
      ) : (
        <div className="game-list">
          <h1 className="arcade-title">ARCADE</h1>
          <div className="game-grid">
            {games.map((game) => (
              <button
                key={game.id}
                className="game-card"
                onClick={() => launchGame(game)}
              >
                <div className="game-card-title">{game.title}</div>
                <p className="game-card-desc">{game.description}</p>
                <div className="game-card-tags">
                  {game.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
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
