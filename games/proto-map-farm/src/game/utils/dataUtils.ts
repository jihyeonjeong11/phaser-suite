import { Scene } from 'phaser'
import { DATA_KEYS } from './constants/dataKeys'

export interface AnimationDef {
  key: string
  assetKey: string
  frames?: number[]
  frameRate: number
  repeat: number
}

export class DataUtils {
  static getAnimations(scene: Scene): AnimationDef[] {
    return scene.cache.json.get(DATA_KEYS.ANIMATIONS)
  }
}
