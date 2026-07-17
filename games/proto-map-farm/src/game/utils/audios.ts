import { Scene } from 'phaser'
import { AUDIO_KEYS, AudioKey } from './constants/audioKeys'

/**
 * Audio Throttle
 */
export function playSound(
  scene: Scene,
  key: AudioKey,
  config?: Phaser.Types.Sound.SoundConfig
): boolean {
  if (scene.sound.isPlaying(key)) {
    return false
  }

  const sound = scene.sound.add(key, config)
  sound.play()
  // 1초만 재생하고 정지 후 인스턴스 정리
  scene.time.delayedCall(1000, () => {
    sound.stop()
    sound.destroy()
  })
  return true
}

export function stopAllSfx(scene: Scene): void {
  scene.sound
    .getAllPlaying()
    .filter((sound) => sound.key !== AUDIO_KEYS.BGM)
    .forEach((sound) => sound.stop())
}
