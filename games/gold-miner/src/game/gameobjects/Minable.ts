import { GameObjects, Math as PhaserMath, Scene } from "phaser";
import { MINING_TYPES } from "../utils/constants";

export class Minable extends GameObjects.Container {
  readonly radius: number;
  readonly weight: number;
  readonly value: number;
  #caught: boolean = false;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    key: keyof typeof MINING_TYPES,
  ) {
    super(scene, x, y);

    const config = MINING_TYPES[key];
    this.radius = config.radius;

    if ("isRandom" in config) {
      this.weight = PhaserMath.Between(...config.weightRange);
      this.value = PhaserMath.Between(...config.valueRange);
    } else {
      this.weight = config.weight;
      this.value = config.value;
    }

    const rawKey = config.textureKey;
    const textureKey = Array.isArray(rawKey)
      ? rawKey[Math.floor(Math.random() * rawKey.length)]
      : rawKey;
    const frame = textureKey === "diamond" ? 4 : undefined;
    const img = scene.add.image(0, 0, textureKey, frame);
    img.setDisplaySize(config.displaySize, config.displaySize);
    this.add(img);

    scene.add.existing(this);
  }

  get isCaught(): boolean {
    return this.#caught;
  }

  catch(): void {
    this.#caught = true;
  }
}
