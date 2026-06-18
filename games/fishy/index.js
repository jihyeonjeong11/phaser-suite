// 1. acceleration system   ✅
// 2. Fish entities         ✅ (적 10마리)
// 3. collision             ✅ (오리지널 AABB: 가로=크기합, 세로=크기합/3)
// 4. Eating system         ✅ (내가 크면 먹고 성장, 작으면 게임오버)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width; // 1024
const H = canvas.height; // 768

const SCALE = 1.5;

const ACCEL = 364 * SCALE; // 가속 px/s²
const FRICTION = 0.91; // 마찰(비율이라 스케일 무관)
const PLAYER_START_SIZE = 15 * SCALE; // 시작 반경 px
const WIN_SIZE = 300 * SCALE; // 이 반경 넘으면 승리

// ── 적 (px 단위, 원본 550 좌표계 수치 × SCALE) ──
const ENEMY_COUNT = 10;
const ENEMY_MIN_SIZE = 2 * SCALE; // 최소 반경
const ENEMY_SIZE_RANGE = 72 * SCALE; // 반경 난수 폭
const ENEMY_SPEED_UNIT = 30 * SCALE; // s(-6,-4,-2,2,4)에 곱할 단위속도 px/s
const ENEMY_ENTER_LEFT = -90 * SCALE; // →진행: 왼쪽 밖 등장
const ENEMY_ENTER_RIGHT = 640 * SCALE; // ←진행: 오른쪽 밖 등장
const ENEMY_EXIT_RIGHT = 650 * SCALE; // 이 너머 → 리스폰
const ENEMY_EXIT_LEFT = -100 * SCALE;

const DEBUG_HITBOX = true; // 개발용: 충돌 판정 박스 표시 (가로 size, 세로 size/3)

const State = { READY: "ready", PLAY: "play", OVER: "over", WIN: "win" };
let gameState = State.READY;
let score = 0;
let lastTime = 0;

const sprite = new Image();
sprite.src = "./assets/fish_blue_outline.png";

const keys = {};
window.addEventListener("keydown", (e) => {
  switch (gameState) {
    case State.PLAY:
      keys[e.key] = true;
      break;
    case State.READY:
    case State.OVER:
    case State.WIN:
      restart();
      break;
  }
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function drawFish(cx, cy, size, faceLeft) {
  const d = size * 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (faceLeft) ctx.scale(-1, 1);
  ctx.drawImage(sprite, -d / 2, -d / 2, d, d);
  ctx.restore();
}

function drawHitbox(cx, cy, size, color = "#0f0") {
  const hx = size;
  const hy = size / 3;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - hx, cy - hy, hx * 2, hy * 2);
  ctx.fillStyle = color;
  ctx.fillRect(cx - 2, cy - 2, 4, 4);
  ctx.restore();
}

const player = {
  x: W / 2,
  y: H / 2,
  vx: 0,
  vy: 0,
  size: PLAYER_START_SIZE,
  facing: 1,
  update(dt) {
    if (keys.ArrowLeft) this.vx -= ACCEL * dt;
    else if (keys.ArrowRight) this.vx += ACCEL * dt;
    if (keys.ArrowUp) this.vy -= ACCEL * dt;
    else if (keys.ArrowDown) this.vy += ACCEL * dt;

    const decay = Math.exp(-FRICTION * dt);
    this.vx *= decay;
    this.vy *= decay;

    if (this.vx > 5) this.facing = 1;
    else if (this.vx < -5) this.facing = -1;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x > W) this.x = 0;
    else if (this.x < 0) this.x = W;
    const half = this.size;
    if (this.y < half) {
      this.y = half;
      this.vy = 0;
    } else if (this.y > H - half) {
      this.y = H - half;
      this.vy = 0;
    }
  },
  draw() {
    drawFish(this.x, this.y, this.size, this.facing === -1);
  },
};

const enemies = {
  list: [],
  init() {
    this.list.length = 0;
    for (let i = 0; i < ENEMY_COUNT; i++) this.list.push(this.spawn());
    return this;
  },
  spawn(e = {}) {
    e.size = Math.random() * ENEMY_SIZE_RANGE + ENEMY_MIN_SIZE;
    let s = Math.max(Math.floor(Math.random() * 6) - 3) * 2; // {-6,-4,-2,0,2,4}
    if (s === 0) s = 2;
    e.vx = s * ENEMY_SPEED_UNIT;
    e.x = s > 0 ? ENEMY_ENTER_LEFT : ENEMY_ENTER_RIGHT;
    e.y = Math.random() * H;
    return e;
  },
  update(dt) {
    for (const e of this.list) {
      e.x += e.vx * dt;
      if (e.x > ENEMY_EXIT_RIGHT || e.x < ENEMY_EXIT_LEFT) this.spawn(e);
    }
  },
  draw() {
    for (const e of this.list) drawFish(e.x, e.y, e.size, e.vx < 0);
  },
};

function handleCollisions() {
  for (const e of enemies.list) {
    const sum = player.size + e.size;
    if (Math.abs(e.x - player.x) < sum && Math.abs(e.y - player.y) < sum / 3) {
      if (player.size > e.size) {
        player.size += e.size / 50;
        score += e.size * 6;
        enemies.spawn(e);
        if (player.size > WIN_SIZE) gameState = State.WIN;
      } else {
        gameState = State.OVER;
      }
    }
  }
}

function restart() {
  player.x = W / 2;
  player.y = H / 2;
  player.vx = player.vy = 0;
  player.size = PLAYER_START_SIZE;
  player.facing = 1;
  score = 0;
  enemies.init();
  gameState = State.PLAY;
}

function drawHUD() {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "bold 28px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + parseInt(score), 16, 36);

  if (gameState === State.PLAY) return;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 48px sans-serif";

  if (gameState === State.READY) {
    ctx.fillText("FISHY", W / 2, H / 2 - 10);
    ctx.font = "24px sans-serif";
    ctx.fillText("Press any key to start", W / 2, H / 2 + 36);
  } else {
    ctx.fillText(
      gameState === State.WIN ? "YOU WIN!" : "GAME OVER",
      W / 2,
      H / 2 - 10,
    );
    ctx.font = "24px sans-serif";
    ctx.fillText("Press any key to restart", W / 2, H / 2 + 36);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  ctx.clearRect(0, 0, W, H);

  if (gameState === State.PLAY) {
    player.update(dt);
    enemies.update(dt);
    handleCollisions();
  }

  player.draw();
  enemies.draw();

  if (DEBUG_HITBOX) {
    drawHitbox(player.x, player.y, player.size, "#0ff");
    for (const e of enemies.list) drawHitbox(e.x, e.y, e.size, "#f0f");
  }

  drawHUD();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
