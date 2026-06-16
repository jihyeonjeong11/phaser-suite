const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let gameOver = false;

const bgImg = new Image();

const GRAVITY = 0.5;
const JUMPING_POWER = -3.6;

const X_SPEED = 2;

addEventListener("pointerdown", (e) => {
  Bird.jump();
});

addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    Bird.jump();
  }
});

/**
 * steps1: draw bird
 *  - Start bird from the center Y of the canvas
 *  - Gravity Makes the bird fall down
 *  - Space key makes the bird jump up
 *  - Calculate this on every 60Hz frame (60 frames per second)
 * steps2: add gravity and jump control
 * steps3: advance map
 *   - Not background, make land to go left and draw land to right?
 * steps4: draw pipes
 * steps5: add collision detection
 *
 *
 * steps6: add score
 * steps7: add game over screen
 * steps8: add start screen
 * steps9: add restart button
 * steps10: add mobile controls
 * steps11: add sound effects
 * steps12: add background music
 * steps13: add animations
 */

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

const Bird = {
  sprite: new Image(),
  x: 40,
  y: canvas.height / 2,
  width: 16,
  height: 16,
  sprite: new Image(),
  gravity: 0.1,
  scale: 3,
  speed: 0,
  draw() {
    ctx.drawImage(
      this.sprite,
      0,
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
    this.speed += this.gravity;
    this.y += this.speed;
  },
  jump() {
    this.speed = -3.6;
  },
  hitGround() {
    if (Bird.y + Bird.height * this.scale >= canvas.height - Ground.height) {
      gameOver = true;
    }
  },
  hitPipe() {
    const left = this.x - this.width / 2;
    const right = left + this.width * this.scale;
    const top = this.y;
    const bottom = this.y + this.height * this.scale;

    Pipe.pipes.forEach((p) => {
      const overlapX = right > p.x && left < p.x + PIPE_W;
      const outsideGap = top < p.gapY || bottom > p.gapY + PIPE_GAP;
      if (overlapX && outsideGap) {
        gameOver = true;
      }
    });
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
    this.x -= X_SPEED;
    if (this.x <= -canvas.width) this.x += canvas.width;
  },
};

const PIPE_GAP = 150;
const PIPE_W = 100;
const PIPE_H = 400;
const PIPE_SPACING = 220;

const Pipe = {
  sprite: new Image(),
  pipes: [],

  setupGapBetweenPipes() {
    const groundTop = canvas.height - Ground.height;
    const min = 60;
    const max = groundTop - PIPE_GAP - 60;
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
        p.gapY - PIPE_H,
        PIPE_W,
        PIPE_H,
      );
      ctx.drawImage(
        this.sprite,
        0,
        0,
        32,
        80,
        p.x,
        p.gapY + PIPE_GAP,
        PIPE_W,
        PIPE_H,
      );
    });
  },

  update() {
    this.pipes.forEach((p) => (p.x -= X_SPEED));

    const last = this.pipes[this.pipes.length - 1];
    if (!last || last.x <= canvas.width - PIPE_SPACING) {
      this.pipes.push({ x: canvas.width, gapY: this.setupGapBetweenPipes() });
    }

    if (this.pipes.length && this.pipes[0].x < -PIPE_W) {
      this.pipes.shift();
    }
  },
};

bgImg.src = "./assets/Background4.png";
Bird.sprite.src = "./assets/Bird1-1.png";
Ground.sprite.src = "./assets/TileStyle1.png";
Pipe.sprite.src = "./assets/PipeStyle1.png";

let lastTime = 0;

function loop(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  Pipe.draw();
  Ground.draw();
  Bird.draw();

  if (now >= lastTime + 20) {
    Bird.hitGround();
    Bird.hitPipe();
    Bird.update();
    Ground.update();
    Pipe.update();
    lastTime += 20;
  }

  if (!gameOver) requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
