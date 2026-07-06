import { Scene } from "phaser";
import { AudioKey } from "./constants/audioKeys";

/**
 * Audio Throttle
 */
export function playSound(
  scene: Scene,
  key: AudioKey,
  config?: Phaser.Types.Sound.SoundConfig,
): boolean {
  if (scene.sound.isPlaying(key)) {
    return false;
  }

  scene.sound.play(key, config);
  return true;
}
