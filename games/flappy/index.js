// Flappy — vanilla canvas (no Phaser)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/**
 * steps1: draw bird
 * steps2: add gravity and jump control
 * steps3: advance map
 * steps4: draw pipes
 * steps5: add collision detection
 * steps6: add score
 * steps7: add game over screen
 */

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Flappy — ready", canvas.width / 2, canvas.height / 2);

  requestAnimationFrame(loop);
}

loop();
