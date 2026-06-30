import { GameObjects, Scene } from "phaser";
import { Character, IMovement } from "./Character";
import { Weapon } from "./Weapon";
import { Tool } from "./Tool";

export class Player extends Character {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private hand?: Weapon | Tool | null;

  constructor(scene: Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.equip(new Weapon(scene, x, y, "weapon1"));
    scene.input.on("pointerdown", () => this.shoot());
    this.registerDebugKeys(scene);
  }

  equip(item: Weapon | Tool): void {
    if (this.hand) this.hand.destroy();
    this.hand = item;
    item.setDepth(this.depth + 1);
  }

  private registerDebugKeys(scene: Scene): void {
    const kb = scene.input.keyboard!;
    // testing-m1a1
    kb.on("keydown-ONE", () =>
      this.equip(new Weapon(scene, this.x, this.y, "weapon1")),
    );
    // testing-wateringcan
    kb.on("keydown-TWO", () =>
      this.equip(new Tool(scene, this.x, this.y, "tools", 0)),
    );
    // testing-pickaxe
    kb.on("keydown-THREE", () =>
      this.equip(new Tool(scene, this.x, this.y, "tools", 1)),
    );
    // testing-hoe
    kb.on("keydown-FOUR", () =>
      this.equip(new Tool(scene, this.x, this.y, "tools", 2)),
    );
    // testing-axe
    kb.on("keydown-FIVE", () =>
      this.equip(new Tool(scene, this.x, this.y, "tools", 3)),
    );
  }

  shoot(): void {
    if (this.hand instanceof Weapon) this.hand.fire();
  }

  getBullets(): GameObjects.Group | undefined {
    return this.hand instanceof Weapon ? this.hand.getBullets() : undefined;
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    this.updateAim();
    this.hand?.updateOffset(this, this.getDirection);
  }

  private updateAim(): void {
    if (this.hand instanceof Weapon) {
      const pointer = this.scene.input.activePointer;
      const wp = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const angle = Math.atan2(wp.y - this.y, wp.x - this.x);
      this.hand.setRotation(angle);
    }
  }

  protected getMovement(): IMovement {
    const c = this.cursors;
    return {
      vx: (c.right.isDown ? 1 : 0) - (c.left.isDown ? 1 : 0),
      vy: (c.down.isDown ? 1 : 0) - (c.up.isDown ? 1 : 0),
    };
  }
}
