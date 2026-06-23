import { Scene } from "phaser";

export function getFrameNames(scene: Scene) {
  return scene.textures.get("tiles").getFrameNames();
}
