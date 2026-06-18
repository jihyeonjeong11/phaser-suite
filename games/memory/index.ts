const game = document.getElementById("game");

if (!game) {
  throw new Error("#game container not found");
}

// Scaffold check — replace with the real board once Core logics are filled in.
game.textContent = "Memory — TS + Vite ready";
