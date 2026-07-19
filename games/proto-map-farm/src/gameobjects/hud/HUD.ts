import { GameObjects, Scene } from 'phaser'
import { Player } from '../characters/Player'

export class HUD {
  private scene: Scene
  private player: Player
  private container: GameObjects.Container
  private hpText: GameObjects.Text
  private staminaText: GameObjects.Text

  constructor(scene: Scene, player: Player) {
    this.scene = scene
    this.player = player
    // hp 바, 스태미너 바
    const [hpText, staminaText] = this.createTexts()
    this.hpText = hpText
    this.staminaText = staminaText
    this.container = scene.add
      .container(10, 10, [this.createStatusBar(), this.hpText, this.staminaText])
      .setScrollFactor(0)
      .setDepth(10000)
  }

  update() {
    this.hpText.setText(`HP: ${this.player.baseHp}`)
    this.staminaText.setText(`Stamina: ${this.player.computedStamina}`)
  }

  // todo: 나중에 진짜 그래픽 바로 바꿀 것
  private createTexts() {
    return [
      this.scene.add.text(10, 10, 'hp', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000'
      }),
      this.scene.add.text(10, 30, 'stamina', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000'
      })
    ]
  }

  private createStatusBar() {
    const graphics = this.scene.add.graphics()
    const menuColor = 0x000000
    graphics.fillStyle(menuColor)
    graphics.fillRect(1, 0, 300, 100)
    // g.setAlpha(0.9);
    return graphics
  }
}
