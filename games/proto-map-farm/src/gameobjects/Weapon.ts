import { GameObjects, Scene } from "phaser";
import { Bullet } from "./Bullet";

// use mouse targeting
export class Weapon extends GameObjects.Sprite {
  private static readonly OFFSET_X = 10;
  private static readonly OFFSET_Y = 3;
  private static readonly FIRE_RATE = 250;
  private static readonly BULLET_SPEED = 600;

  private bullets: GameObjects.Group;
  private lastFired = 0;

  constructor(scene: Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    this.setScale(1);
    this.bullets = scene.add.group();
  }

  updateOffset(owner: GameObjects.Sprite): void {
    const left = owner.flipX;
    this.x = owner.x + (left ? -Weapon.OFFSET_X : Weapon.OFFSET_X);
    this.y = owner.y + Weapon.OFFSET_Y;
    this.setFlipY(left);
  }

  getBullets(): GameObjects.Group {
    return this.bullets;
  }

  fire(): void {
    const now = this.scene.time.now;
    if (now < this.lastFired + Weapon.FIRE_RATE) return;
    this.lastFired = now;

    const angle = this.rotation;
    const muzzle = (1 - this.originX) * this.displayWidth;
    const mx = this.x + Math.cos(angle) * muzzle;
    const my = this.y + Math.sin(angle) * muzzle;

    const bullet = new Bullet(this.scene, mx, my, angle, Weapon.BULLET_SPEED);
    this.bullets.add(bullet);

    this.scene.sound.play("gunfire");
  }
}
