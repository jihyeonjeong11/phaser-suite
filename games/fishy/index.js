const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const fishImg = new Image();

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

const Fish = {
  width: 64,
  height: 64,
  x: (canvas.width - 64) / 2,
  y: (canvas.height - 64) / 2,
  speed: 240,
  draw() {
    ctx.drawImage(fishImg, this.x, this.y, this.width, this.height);
  },
  update(dt) {
    const dist = this.speed * dt;
    if (keys.ArrowLeft) this.x -= dist;
    if (keys.ArrowRight) this.x += dist;
    if (keys.ArrowUp) this.y -= dist;
    if (keys.ArrowDown) this.y += dist;
  },
};

fishImg.src = "./assets/fish_blue_outline.png";

let lastTime = 0;

function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Fish.update(dt);
  Fish.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
