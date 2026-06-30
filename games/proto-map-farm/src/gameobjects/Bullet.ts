import { Physics, Scene } from "phaser";

export class Bullet extends Physics.Arcade.Image {
  private static readonly LIFESPAN = 1000;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    angle: number,
    speed: number,
  ) {
    Bullet.ensureTexture(scene);
    super(scene, x, y, "bullet");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setRotation(angle).setDepth(25);
    scene.physics.velocityFromRotation(
      angle,
      speed,
      (this.body as Physics.Arcade.Body).velocity,
    );
    scene.time.delayedCall(Bullet.LIFESPAN, () => this.destroy());
  }

  private static ensureTexture(scene: Scene): void {
    if (scene.textures.exists("bullet")) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffe066, 1);
    g.fillRect(0, 0, 6, 2);
    g.generateTexture("bullet", 6, 2);
    g.destroy();
  }
}
