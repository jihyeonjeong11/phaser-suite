import { Scene, Scale, Scenes, GameObjects } from 'phaser'
import { dataManager } from '../managers/Store'
import { DEFAULT_MAP_KEY } from '../utils/constants/mapKeys'
import { globalConfig } from '../utils/constants/GlobalConfig'
import { BaseModal } from '../components/modal/BaseModal'

const BTN_WIDTH = 180
const BTN_HEIGHT = 56
const BTN_GAP = 48 // ≈ 3em
const BTN_MARGIN_BOTTOM = 90

export class MainMenu extends Scene {
  title: GameObjects.Text
  modal: BaseModal
  private bg: GameObjects.Image
  private buttons: GameObjects.Container[] = []

  constructor() {
    super('MainMenu')
    this.modal = new BaseModal(this)
  }

  create() {
    this.sound.play('bgm', { loop: true, volume: globalConfig.getVolume() })

    // 배경: 화면을 꽉 채우고, 다른 UI보다 뒤에 오도록 가장 먼저 생성.
    this.bg = this.add.image(0, 0, 'menu-bg').setOrigin(0.5).setDepth(-1)

    this.title = this.add
      .text(0, 0, 'Apocalyptic farming game proto', {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center'
      })
      .setOrigin(0.5)

    this.buildMenu()
    this.layout()

    // 해상도 변경(setGameSize) 시 RESIZE 이벤트로 재배치. 리스타트 없이 위치만 갱신.
    this.scale.on(Scale.Events.RESIZE, this.layout, this)
    // 씬 종료 시 리스너 해제(안 하면 파괴된 오브젝트에 layout이 호출되어 에러).
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Scale.Events.RESIZE, this.layout, this)
    })
  }

  // 현재 게임 크기 기준으로 타이틀/버튼 위치를 다시 계산해 배치한다.
  private layout(): void {
    const w = this.scale.width
    const h = this.scale.height

    // 배경을 화면 중앙에 놓고 화면 전체를 덮도록 크기 조정.
    this.bg.setPosition(w / 2, h / 2).setDisplaySize(w, h)

    this.title.setPosition(w / 2, 120)

    const n = this.buttons.length
    const rowWidth = n * BTN_WIDTH + (n - 1) * BTN_GAP
    const startX = (w - rowWidth) / 2 + BTN_WIDTH / 2
    const y = h - BTN_MARGIN_BOTTOM
    this.buttons.forEach((btn, i) => btn.setPosition(startX + i * (BTN_WIDTH + BTN_GAP), y))
  }

  private buildMenu(): void {
    this.buttons = [
      this.createButton('New Game', true, () => this.startNewGame()),
      this.createButton('Continue', dataManager.hasSave(), () => {
        dataManager.load()
        this.scene.start('Game', {
          fromSave: true,
          area: dataManager.getPlayerData().currentMapKey
        })
      }),
      this.createButton('Options', true, () => this.modal.openOptionsModal())
    ]
  }

  // 위치는 layout()이 잡으므로 (0,0)으로 생성만 한다.
  private createButton(
    label: string,
    enabled: boolean,
    onClick: () => void
  ): GameObjects.Container {
    const bgColor = enabled ? 0x2d5a34 : 0x3a3a3a
    const textColor = enabled ? '#ffffff' : '#888888'

    const bg = this.add
      .rectangle(0, 0, BTN_WIDTH, BTN_HEIGHT, bgColor)
      .setStrokeStyle(2, 0xffffff, enabled ? 1 : 0.3)

    const text = this.add
      .text(0, 0, label, {
        fontFamily: 'Arial Black',
        fontSize: 22,
        color: textColor
      })
      .setOrigin(0.5)

    const container = this.add.container(0, 0, [bg, text])

    if (enabled) {
      bg.setInteractive({ useHandCursor: true })
      bg.on('pointerover', () => bg.setFillStyle(0x3f7a49))
      bg.on('pointerout', () => bg.setFillStyle(bgColor))
      bg.on('pointerdown', onClick)
    }

    return container
  }

  private startNewGame(): void {
    dataManager.reset()
    this.scene.start('Game', { fromSave: false, area: DEFAULT_MAP_KEY })
  }
}
