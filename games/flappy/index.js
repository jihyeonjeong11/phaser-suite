const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const Options = {
  gravity: 0.6,
  jumpPower: -9.3,
  speed: 2.1,
  pipeGap: 156,
  pipeWidth: 100,
  pipeHeight: 400,
  pipeSpacing: 220,
};

const State = { READY: "ready", PLAY: "play", OVER: "over" };

const DEBUG = false;

let gameState = State.READY;
let score = 0;
let lastTime = 0;

const bgImg = new Image();

const Bird = {
  sprite: new Image(),
  x: 40,
  y: canvas.height / 2,
  width: 16,
  height: 16,
  scale: 3,
  speed: 0,
  hitbox: { top: 3, bottom: 1, left: 2, right: 2 },
  activeIdx: 0,
  frameTick: 0,
  spriteFrame: [0, 16, 32, 48],
  draw() {
    const nextSprite = this.spriteFrame[this.activeIdx];
    ctx.drawImage(
      this.sprite,
      nextSprite,
      0,
      this.width,
      this.height,
      this.x - this.width / 2,
      this.y,
      this.width * this.scale,
      this.height * this.scale,
    );
  },
  update() {
    this.speed += Options.gravity;
    this.y += this.speed;

    this.frameTick += 1;
    if (this.frameTick % 3 === 0) {
      this.activeIdx = (this.activeIdx + 1) % this.spriteFrame.length; // 값만 바꿈
    }
  },
  jump() {
    // this.sprite.rotate?

    this.speed = Options.jumpPower;
    SFX.play("flap");
  },
  getRect() {
    const hb = this.hitbox;
    const spriteX = this.x - this.width / 2;
    return {
      left: spriteX + hb.left * this.scale,
      right: spriteX + (this.width - hb.right) * this.scale,
      top: this.y + hb.top * this.scale,
      bottom: this.y + (this.height - hb.bottom) * this.scale,
    };
  },
};

const Ground = {
  sprite: new Image(),
  height: 100,
  x: 0,
  y: 0,

  draw() {
    this.y = canvas.height - this.height;
    for (let dx = this.x; dx < canvas.width; dx += canvas.width) {
      ctx.drawImage(
        this.sprite,
        16,
        80,
        48,
        16,
        dx,
        this.y,
        canvas.width,
        this.height,
      );
    }
  },
  update() {
    this.x -= Options.speed;
    if (this.x <= -canvas.width) this.x += canvas.width;
  },
  hits(rect) {
    return rect.bottom >= canvas.height - this.height;
  },
};

const Pipe = {
  sprite: new Image(),
  pipes: [],

  setupGapBetweenPipes() {
    const groundTop = canvas.height - Ground.height;
    const min = 60;
    const max = groundTop - Options.pipeGap - 60;
    return min + Math.random() * (max - min);
  },

  draw() {
    this.pipes.forEach((p) => {
      ctx.drawImage(
        this.sprite,
        0,
        0,
        32,
        80,
        p.x,
        p.gapY - Options.pipeHeight,
        Options.pipeWidth,
        Options.pipeHeight,
      );
      ctx.drawImage(
        this.sprite,
        0,
        0,
        32,
        80,
        p.x,
        p.gapY + Options.pipeGap,
        Options.pipeWidth,
        Options.pipeHeight,
      );
    });
  },

  update() {
    this.pipes.forEach((p) => (p.x -= Options.speed));

    const last = this.pipes[this.pipes.length - 1];
    if (!last || last.x <= canvas.width - Options.pipeSpacing) {
      this.pipes.push({ x: canvas.width, gapY: this.setupGapBetweenPipes() });
    }

    if (this.pipes.length && this.pipes[0].x < -Options.pipeWidth) {
      score++;
      this.pipes.shift();
    }
  },

  hits(rect) {
    return this.pipes.some((p) => {
      const overlapX = rect.right > p.x && rect.left < p.x + Options.pipeWidth;
      const outsideGap =
        rect.top < p.gapY || rect.bottom > p.gapY + Options.pipeGap;
      return overlapX && outsideGap;
    });
  },
};

bgImg.src = "./assets/Background4.png";
Bird.sprite.src = "./assets/Bird1-1.png";
Ground.sprite.src = "./assets/TileStyle1.png";
Pipe.sprite.src = "./assets/PipeStyle1.png";

const SFX = {
  flap: new Audio("./assets/flap.mp3"),
  crash: new Audio("./assets/crash.mp3"),
  play(name) {
    const audio = this[name];
    audio.currentTime = 0;
    audio.play();
  },
};

function drawBackground() {
  ctx.drawImage(
    bgImg,
    0,
    0,
    bgImg.width,
    bgImg.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
}

function drawScore() {
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";
  ctx.strokeText(score, canvas.width / 2, 30);

  ctx.fillText(score, canvas.width / 2, 30);
}

function drawGameOver() {
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.strokeText("Game Over", canvas.width / 2, canvas.height / 2 - 50, 200);
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 50, 200);

  ctx.strokeText(score, canvas.width / 2, canvas.height / 2, 100);
  ctx.fillText(score, canvas.width / 2, canvas.height / 2, 100);
}

function drawInstruction() {
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#fff";

  ctx.font = "40px sans-serif";
  ctx.strokeText("Flappy", canvas.width / 2, canvas.height / 2 - 80);
  ctx.fillText("Flappy", canvas.width / 2, canvas.height / 2 - 80);

  ctx.font = "24px sans-serif";
  ctx.strokeText(
    "Tap or Space to flap",
    canvas.width / 2,
    canvas.height / 2 - 20,
  );
  ctx.fillText(
    "Tap or Space to flap",
    canvas.width / 2,
    canvas.height / 2 - 20,
  );

  ctx.strokeText("Avoid the pipes", canvas.width / 2, canvas.height / 2 + 14);
  ctx.fillText("Avoid the pipes", canvas.width / 2, canvas.height / 2 + 14);
}

function drawHitboxes() {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  const r = Bird.getRect();
  ctx.strokeRect(r.left, r.top, r.right - r.left, r.bottom - r.top);

  Pipe.pipes.forEach((p) => {
    ctx.strokeRect(
      p.x,
      p.gapY - Options.pipeHeight,
      Options.pipeWidth,
      Options.pipeHeight,
    );
    ctx.strokeRect(
      p.x,
      p.gapY + Options.pipeGap,
      Options.pipeWidth,
      Options.pipeHeight,
    );
  });
}

function reset() {
  score = 0;
  Bird.y = canvas.height / 2;
  Bird.speed = 0;
  Pipe.pipes = [];
  Ground.x = 0;
}

function handleInput() {
  switch (gameState) {
    case State.READY:
      gameState = State.PLAY;
      Bird.jump();
      break;
    case State.PLAY:
      Bird.jump();
      break;
    case State.OVER:
      reset();
      gameState = State.READY;
      break;
  }
}

addEventListener("pointerdown", () => handleInput());

addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput();
});

function loop(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  Pipe.draw();
  Ground.draw();
  Bird.draw();

  if (gameState === State.PLAY) drawScore();

  if (gameState === State.READY) drawInstruction();
  if (gameState === State.OVER) drawGameOver();
  if (DEBUG) drawHitboxes();
  if (now >= lastTime + 20) {
    if (gameState === State.PLAY) {
      Bird.update();
      Ground.update();
      Pipe.update();

      const rect = Bird.getRect();
      if (Ground.hits(rect) || Pipe.hits(rect)) {
        gameState = State.OVER;

        SFX.play("crash");
      }
    }
    lastTime += 20;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
