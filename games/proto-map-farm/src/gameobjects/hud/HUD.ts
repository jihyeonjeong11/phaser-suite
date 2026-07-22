import { GameObjects, Scene } from 'phaser'
import { Player } from '../characters/Player'

export class HUD {
  private scene: Scene
  private player: Player
  private container: GameObjects.Container
  private hpText: GameObjects.Text
  private staminaText: GameObjects.Text
  private hpIcon: GameObjects.Sprite
  private staminaIcon: GameObjects.Sprite

  constructor(scene: Scene, player: Player) {
    this.scene = scene
    this.player = player

    this.hpIcon = this.drawHealth()
    this.staminaIcon = this.drawStamina()
    this.container = scene.add
      .container(30, 30, [this.hpIcon, this.staminaIcon])
      .setScrollFactor(0)
      .setDepth(10000)
  }

  update() {
    this.hpText.setText(`HP: ${Math.round(this.player.computedHP)}`)
    const staminaLabel = this.player.isExhausted
      ? `Stamina: ${Math.round(this.player.computedStamina)} (EXHAUSTED)`
      : `Stamina: ${Math.round(this.player.computedStamina)}`
    this.staminaText.setText(staminaLabel)
    this.staminaText.setColor(this.player.isExhausted ? '#ff5555' : '#ffffff')

    this.tintByRatio(this.hpIcon, this.player.computedHP, this.player.baseHp)
    this.tintByRatio(this.staminaIcon, this.player.computedStamina, this.player.baseStamina)
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
