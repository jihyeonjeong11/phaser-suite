import { GameObjects, Scene } from 'phaser'

export interface HudStats {
  hp: number
  maxHp: number
  stamina: number
  maxStamina: number
}

export class HUD {
  private scene: Scene
  private container: GameObjects.Container
  private hpIcon: GameObjects.Sprite
  private staminaIcon: GameObjects.Sprite

  constructor(scene: Scene) {
    this.scene = scene

    this.hpIcon = this.drawHealth()
    this.staminaIcon = this.drawStamina()
    // hud 신은 상시 떠 있으므로, 게임 스탯을 받기 전(MainMenu 등)에는 숨겨둔다.
    this.container = scene.add
      .container(30, 30, [this.hpIcon, this.staminaIcon])
      .setDepth(10000)
      .setVisible(false)
  }

  setVisible(visible: boolean) {
    this.container.setVisible(visible)
  }

  update(stats: HudStats) {
    this.container.setVisible(true)
    this.tintByRatio(this.hpIcon, stats.hp, stats.maxHp)
    this.tintByRatio(this.staminaIcon, stats.stamina, stats.maxStamina)
  }

  private tintByRatio(icon: GameObjects.Sprite, current: number, max: number): void {
    const ratio = Math.max(0, Math.min(1, current / max))
    const level = (Math.ceil(ratio / 0.2) / 5) * 255
    const c = Math.round(level)
    icon.setTint((c << 16) | (c << 8) | c)
  }

  private drawHealth() {
    return this.scene.add.sprite(0, 0, 'icons', 0)
  }

  private drawStamina() {
    return this.scene.add.sprite(0, 40, 'icons', 1)
  }
}
