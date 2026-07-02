import { Scene } from "phaser";
import { NPC } from "./NPC";

// 좀비: NPC와 동일한 배회 이동 로직 사용.
// base_char에서 그리고, 헤어는 랜덤 색상(hairs_char row 0~2)으로 오버레이.
export class Zombie extends NPC {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "base_char", Math.floor(Math.random() * 3));
  }
}
