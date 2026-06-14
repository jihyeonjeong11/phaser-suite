import Phaser from "phaser";
import { MINING_TYPES } from "../utils/constants";

export class Minables extends Phaser.GameObjects.Container {
  readonly radius: number;
  readonly weight: number;
  readonly value: number;
  #caught: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: (typeof MINING_TYPES)[keyof typeof MINING_TYPES],
  ) {
    super(scene, x, y);
    this.radius = def.radius;
    this.weight = def.weight;
    this.value = def.value;

    const frame = def.textureKey === "diamond" ? 4 : undefined;
    const img = scene.add.image(0, 0, def.textureKey, frame);
    img.setDisplaySize(def.displaySize, def.displaySize);
    this.add(img);

    scene.add.existing(this);
  }

  get isCaught(): boolean {
    return this.#caught;
  }

  catch(): void {
    this.#caught = true;
  }

  collect(): number {
    this.destroy();
    return this.value;
  }
}
