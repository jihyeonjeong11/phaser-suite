const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Pixel-art sheets use a 64x64 cell, read left-to-right, top-to-bottom.
// cols   = frames per row in the sheet
// frames = how many frames actually play (some sheets have trailing blanks)
// key    = hand-drawn ink-on-white art: keyed to transparency on load
//          (fw/fh = source frame size; defaults to the 64px cell)
const FRAME = 64;
const CHAR_H = 240; // on-screen height for keyed (hand-drawn) characters

const ANIMS = {
  idle: { src: "./assets/Idle/breathing.jpg", cols: 5, frames: 5, fps: 6, loop: true, key: true },
  run: { src: "./assets/Run/Run.png", cols: 9, frames: 9, fps: 12, loop: true },
  jump: { src: "./assets/Jump/Jump.png", cols: 2, frames: 3, fps: 8, loop: false },
  punch: { src: "./assets/Punch/Punch.png", cols: 4, frames: 10, fps: 14, loop: false },
  death: { src: "./assets/Death/Death.png", cols: 3, frames: 9, fps: 10, loop: false },
};

// Turn black-ink-on-white art into transparent line art: alpha = darkness.
// This drops the white background while keeping anti-aliased edges smooth,
// and records the vertical ink bounds so the feet can sit on the floor.
function keyToInk(anim) {
  const img = anim.image;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const octx = off.getContext("2d");
  octx.drawImage(img, 0, 0);

  const data = octx.getImageData(0, 0, w, h);
  const px = data.data;
  let top = h;
  let bottom = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
      const alpha = 255 - lum;
      px[i] = px[i + 1] = px[i + 2] = 0; // force pure black ink
      px[i + 3] = alpha;
      if (alpha > 40) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  octx.putImageData(data, 0, 0);

  anim.image = off; // draw from the keyed canvas instead of the raw image
  anim.fw = w / anim.cols;
  anim.inkTop = top;
  anim.inkH = Math.max(1, bottom - top);
  anim.ready = true;
}

for (const anim of Object.values(ANIMS)) {
  anim.image = new Image();
  if (anim.key) anim.image.onload = () => keyToInk(anim);
  anim.image.src = anim.src;
}

const Stickman = {
  x: canvas.width / 2,
  y: canvas.height - 70, // feet baseline
  scale: 4,
  name: "idle",
  frame: 0,
  acc: 0, // ms accumulator for frame stepping
  done: false, // one-shot finished (holds last frame)
  hop: 0, // vertical offset, just for jump feel
  running: false, // run key currently held

  get anim() {
    return ANIMS[this.name];
  },

  play(name, restart = false) {
    if (this.name === name && !restart) return;
    this.name = name;
    this.frame = 0;
    this.acc = 0;
    this.done = false;
  },

  update(dt) {
    const a = this.anim;
    const step = 1000 / a.fps;
    this.acc += dt;
    while (this.acc >= step) {
      this.acc -= step;
      if (this.frame < a.frames - 1) this.frame++;
      else if (a.loop) this.frame = 0;
      else this.done = true;
    }

    this.hop =
      this.name === "jump"
        ? -Math.sin((this.frame / (a.frames - 1)) * Math.PI) * 60
        : 0;

    // one-shot anims fall back to idle/run when finished (death stays down)
    if (this.done && !a.loop && this.name !== "death") {
      this.play(this.running ? "run" : "idle");
    }
  },

  draw() {
    const a = this.anim;

    // hand-drawn line art: keyed canvas, trimmed to ink, smoothly scaled
    if (a.key) {
      if (!a.ready) return;
      const scale = CHAR_H / a.inkH;
      const dw = a.fw * scale;
      const dh = a.inkH * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        a.image,
        (this.frame % a.cols) * a.fw,
        a.inkTop,
        a.fw,
        a.inkH,
        this.x - dw / 2,
        this.y - dh + this.hop,
        dw,
        dh,
      );
      ctx.imageSmoothingEnabled = false;
      return;
    }

    const col = this.frame % a.cols;
    const row = (this.frame / a.cols) | 0;
    const size = FRAME * this.scale;
    ctx.drawImage(
      a.image,
      col * FRAME,
      row * FRAME,
      FRAME,
      FRAME,
      this.x - size / 2,
      this.y - size + this.hop,
      size,
      size,
    );
  },
};

// --- actions ----------------------------------------------------------------
const isBusy = () => Stickman.name === "jump" || Stickman.name === "punch";

function jump() {
  if (Stickman.name === "death" || isBusy()) return;
  Stickman.play("jump");
}

function punch() {
  if (Stickman.name === "death" || isBusy()) return;
  Stickman.play("punch");
}

function setRun(on) {
  Stickman.running = on;
  if (Stickman.name === "death" || isBusy()) return; // don't cut a one-shot
  if (on && Stickman.name === "idle") Stickman.play("run");
  if (!on && Stickman.name === "run") Stickman.play("idle");
}

function die() {
  if (Stickman.name === "death") return;
  Stickman.play("death", true);
}

function revive() {
  Stickman.running = false;
  Stickman.play("idle", true);
}

// --- input ------------------------------------------------------------------
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  switch (e.code) {
    case "Space":
      e.preventDefault();
      jump();
      break;
    case "KeyF":
      punch();
      break;
    case "ShiftLeft":
    case "ArrowRight":
      setRun(true);
      break;
    case "Enter":
      revive();
      break;
  }
});

addEventListener("keyup", (e) => {
  if (e.code === "ShiftLeft" || e.code === "ArrowRight") setRun(false);
});

document.getElementById("death").addEventListener("click", die);
document.getElementById("revive").addEventListener("click", revive);

// --- scene ------------------------------------------------------------------
const ACCENT = {
  idle: "#3b82f6",
  run: "#22c55e",
  jump: "#f59e0b",
  punch: "#ef4444",
  death: "#6b7280",
};

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawScene() {
  const W = canvas.width;
  const H = canvas.height;
  const floorY = Stickman.y;

  // backdrop
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#eef3fa");
  sky.addColorStop(1, "#d3dded");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // soft radial spotlight behind the stickman
  const glow = ctx.createRadialGradient(
    Stickman.x,
    floorY - 110,
    20,
    Stickman.x,
    floorY - 110,
    240,
  );
  glow.addColorStop(0, "rgba(255,255,255,0.55)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // floor band
  const floor = ctx.createLinearGradient(0, floorY, 0, H);
  floor.addColorStop(0, "#c4cfde");
  floor.addColorStop(1, "#a7b6cb");
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = "rgba(255,255,255,0.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY + 1);
  ctx.lineTo(W, floorY + 1);
  ctx.stroke();

  // contact shadow — shrinks and fades as the stickman lifts off
  const lift = Math.abs(Stickman.hop) / 60; // 0..1
  ctx.save();
  ctx.globalAlpha = 0.28 * (1 - lift * 0.7);
  ctx.fillStyle = "#1b2533";
  ctx.beginPath();
  ctx.ellipse(Stickman.x, floorY, 72 * (1 - lift * 0.45), 13 * (1 - lift * 0.45), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawBadge();
}

function drawBadge() {
  const label = Stickman.name.toUpperCase();
  const pad = 12;
  const dot = 10;
  const gap = 9;
  const h = 36;
  ctx.font = "bold 16px monospace";
  const w = pad + dot + gap + ctx.measureText(label).width + pad;
  const x = 16;
  const y = 16;

  ctx.fillStyle = "rgba(20,28,40,0.85)";
  roundRect(x, y, w, h, 10);
  ctx.fill();

  ctx.fillStyle = ACCENT[Stickman.name] || "#fff";
  ctx.beginPath();
  ctx.arc(x + pad + dot / 2, y + h / 2, dot / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + pad + dot + gap, y + h / 2 + 1);
}

// --- 60fps loop (rAF, dt-based so speed is display-independent) --------------
let last = 0;
function loop(now) {
  const dt = last ? now - last : 0;
  last = now;

  Stickman.update(dt);
  drawScene();
  Stickman.draw();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
