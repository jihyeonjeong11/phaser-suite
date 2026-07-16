import { GameObjects, Scale, Scene } from 'phaser'
import { DEFAULT_CONFIGS, globalConfig } from '../../utils/constants/GlobalConfig'
import { ModalBehavoir } from 'phaser4-rex-plugins/plugins/modal'

export class Modal {
  scene: Scene
  readonly PADDING_X = 120
  readonly PADDING_Y = 80
  constructor(scene: Scene) {
    this.scene = scene
  }

  public openOptionsModal(): void {
    const scene = this.scene
    const cx = scene.scale.width / 2
    const cy = scene.scale.height / 2

    const panel = scene.add.rectangle(0, 0, 420, 300, 0x1e1e1e).setStrokeStyle(2, 0xffffff)
    const heading = scene.add
      .text(0, -120, 'Options', {
        fontFamily: 'Arial Black',
        fontSize: 26,
        color: '#ffffff'
      })
      .setOrigin(0.5)

    const bgmLabel = scene.add
      .text(-150, 0, 'BGM', {
        fontFamily: 'Arial',
        fontSize: 22,
        color: '#ffffff'
      })
      .setOrigin(0, 0.5)
    const isOn = () => globalConfig.getVolume() > 0
    const onColor = 0x2d5a34
    const offColor = 0x5a2d2d

    const toggleBg = scene.add
      .rectangle(110, 0, 100, 44, isOn() ? onColor : offColor)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
    const toggleText = scene.add
      .text(110, 0, isOn() ? 'ON' : 'OFF', {
        fontFamily: 'Arial Black',
        fontSize: 20,
        color: '#ffffff'
      })
      .setOrigin(0.5)

    toggleBg.on('pointerdown', () => {
      const nextVolume = isOn() ? 0 : DEFAULT_CONFIGS.BGM_VOLUME
      globalConfig.setVolume(nextVolume)
      scene.sound.setVolume(nextVolume)
      toggleText.setText(isOn() ? 'ON' : 'OFF')
      toggleBg.setFillStyle(isOn() ? onColor : offColor)
    })

    // --- 해상도 선택(단일 선택 체크박스) ---
    const RESOLUTIONS: Array<[string, number, number]> = [
      ['800 x 600', 800, 600],
      ['1024 x 768', 1024, 768]
    ]

    const resBoxes: {
      box: GameObjects.Rectangle
      check: GameObjects.Text
      w: number
      h: number
    }[] = []
    const resObjects: GameObjects.GameObject[] = []

    const isActiveRes = (w: number, h: number) =>
      scene.scale.width === w && scene.scale.height === h

    const refreshResBoxes = () => {
      resBoxes.forEach((b) => {
        const active = isActiveRes(b.w, b.h)
        b.check.setText(active ? '✓' : '')
        b.box.setFillStyle(active ? onColor : offColor)
      })
    }

    RESOLUTIONS.forEach(([label, w, h], i) => {
      const rowY = 60 + i * 50
      const rowLabel = scene.add
        .text(-150, rowY, label, {
          fontFamily: 'Arial',
          fontSize: 20,
          color: '#ffffff'
        })
        .setOrigin(0, 0.5)
      const box = scene.add
        .rectangle(120, rowY, 34, 34, offColor)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true })
      const check = scene.add
        .text(120, rowY, '', {
          fontFamily: 'Arial Black',
          fontSize: 22,
          color: '#ffffff'
        })
        .setOrigin(0.5)

      box.on('pointerup', () => {
        scene.time.delayedCall(0, () => {
          scene.scale.setGameSize(w, h)
          globalConfig.setResolution({ width: w, height: h })
          refreshResBoxes()
        })
      })

      resBoxes.push({ box, check, w, h })
      resObjects.push(rowLabel, box, check)
    })
    refreshResBoxes()

    const dialog = scene.add.container(cx, cy, [
      panel,
      heading,
      bgmLabel,
      toggleBg,
      toggleText,
      ...resObjects
    ])

    new ModalBehavoir(dialog, {
      cover: { color: 0x000000, alpha: 0.7 },
      touchOutsideClose: true,
      duration: { in: 200, out: 200 },
      transitIn: 1, // fadeIn
      transitOut: 1, // fadeOut
      destroy: true
    })

    const recenter = () => dialog.setPosition(scene.scale.width / 2, scene.scale.height / 2)
    scene.scale.on(Scale.Events.RESIZE, recenter)
    dialog.once('destroy', () => scene.scale.off(Scale.Events.RESIZE, recenter))
  }
}
