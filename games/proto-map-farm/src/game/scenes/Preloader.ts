import { Scene } from 'phaser'
import { MAP_KEYS } from '../utils/constants/mapKeys'
import { DATA_KEYS } from '../utils/constants/dataKeys'
import { DataUtils } from '../utils/dataUtils'

export class Preloader extends Scene {
  constructor() {
    super('Preloader')
  }

  init() {
    // Loading bar (based on gamedevacademy Phaser 3 preloading screen tutorial)
    const { width, height } = this.scale

    const progressBox = this.add.graphics()
    const progressBar = this.add.graphics()

    const boxWidth = 320
    const boxHeight = 50
    const boxX = width / 2 - boxWidth / 2
    const boxY = height / 2 - boxHeight / 2

    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(boxX, boxY, boxWidth, boxHeight)

    this.add
      .text(width / 2, boxY - 20, 'Loading...', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    const percentText = this.add
      .text(width / 2, boxY + boxHeight / 2, '0%', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    const assetText = this.add
      .text(width / 2, boxY + boxHeight + 20, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(boxX + 10, boxY + 10, (boxWidth - 20) * value, boxHeight - 20)
      percentText.setText(`${Math.round(value * 100)}%`)
    })

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      assetText.setText(`Loading asset: ${file.key}`)
    })
  }

  preload() {
    // Testing tile map sheet from itch.io // todo: draw tilemap!
    this.load.setPath('assets')

    // Farm: rebuilt at 32px on the LPC farm tilesets.
    // Image keys must equal each tileset image's basename (Worldmap.imageKeyFor).
    this.load.json(DATA_KEYS.ANIMATIONS, 'json/animation.json')

    this.load.tilemapTiledJSON(MAP_KEYS.FARM, 'json/farm_json.json')
    // 96×192, 32px 셀 → 3열×6행. 타일셋이자 개별 프레임(갈린 흙)으로 접근하므로 스프라이트시트로 로드.
    this.load.spritesheet('plowed_soil', 'tilesets/farm/plowed_soil.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    // 96×192, 32px 셀 → 3열×6행. 풀 tuft는 프레임 인덱스로 접근.
    this.load.spritesheet('tallgrass', 'tilesets/farm/tallgrass.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    // 96×192, 32px 셀 → 3열×6행. 풀 tuft는 프레임 인덱스로 접근.
    this.load.spritesheet('wheat', 'tilesets/farm/wheat.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('fence_alt', 'tilesets/farm/fence_alt.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    // 288×384, 32px 셀 → 9열×12행. 작물 성장 단계/수확물 아이콘을 프레임 인덱스로 접근.
    this.load.spritesheet('plants', 'tilesets/farm/plants.png', {
      frameWidth: 32,
      frameHeight: 32
    })

    this.load.tilemapTiledJSON(MAP_KEYS.HOME, 'json/home_json.json')
    this.load.spritesheet('farming_fishing', 'tilesets/farm/farming_fishing.png', {
      frameWidth: 32,
      frameHeight: 32
    })

    this.load.tilemapTiledJSON(MAP_KEYS.RUIN, 'json/ruin_json.json')
    this.load.spritesheet('apocalypse', 'tilesets/ruin/apocalypse.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('7DRL-Tiles2', 'tilesets/ruin/7DRL-Tiles2.png', {
      frameWidth: 32,
      frameHeight: 32
    })

    // Cliff: LPC cliffs tileset.
    // Image keys must equal each tileset image's basename (Worldmap.imageKeyFor).
    this.load.tilemapTiledJSON(MAP_KEYS.CLIFF, 'json/cliff_json.json')
    this.load.spritesheet('LPC_cliffs_grass', 'tilesets/terrain/LPC_cliffs_grass.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    // 물 타일 등 terrain 타일셋 (cliff_json에서 firstgid 1504로 참조)
    this.load.spritesheet('terrain', 'tilesets/terrain/terrain.png', {
      frameWidth: 32,
      frameHeight: 32
    })
    this.load.spritesheet('tent-tan', 'img/tent-tan.png', {
      frameWidth: 32,
      frameHeight: 32
    })

    this.load.spritesheet('heart_anim', 'sprites/heart_anim.png', {
      frameWidth: 128,
      frameHeight: 256
    })

    // 256×64, 64px 셀 → 4열×1행. base_char와 같은 규칙: [0,1]=idle, [2,3]=walk
    this.load.spritesheet('zombies', 'sprites/zombies.png', {
      frameWidth: 64,
      frameHeight: 64
    })

    // Drawn by me
    const resources = [
      {
        type: 'spritesheet',
        key: 'weapons',
        url: 'weapons.png',
        frameWidth: 64,
        frameHeight: 64
      },
      {
        type: 'spritesheet',
        key: 'tools',
        url: 'farming_tools.png',
        frameWidth: 64,
        frameHeight: 16
      },
      {
        type: 'spritesheet',
        key: 'base_char',
        url: 'sprites/base_char.png', // 좀비(64) 복사본 → 재작성 예정. frameWidth 재작성 시 맞출 것
        frameWidth: 64,
        frameHeight: 64
      },
      {
        type: 'spritesheet',
        key: 'hairs_char',
        url: 'hairs_char.png',
        frameWidth: 16,
        frameHeight: 20
      },
      { type: 'audio', key: 'bgm', url: 'musics/background.mp3' },
      { type: 'audio', key: 'gunfire', url: 'sounds/gunfire.mp3' },
      { type: 'audio', key: 'pickaxe', url: 'sounds/pickaxe.mp3' },
      { type: 'audio', key: 'axe', url: 'sounds/axe.mp3' },
      { type: 'audio', key: 'hoe', url: 'sounds/hoe.mp3' },
      { type: 'audio', key: 'watering', url: 'sounds/watering.mp3' },
      { type: 'audio', key: 'footstep', url: 'sounds/footstep.mp3' }
    ]

    resources.forEach((resource) => {
      if (resource.type === 'spritesheet') {
        const r = resource as {
          type: 'spritesheet'
          key: string
          url: string
          frameWidth: number
          frameHeight: number
        }
        this.load.spritesheet(r.key, r.url, {
          frameWidth: r.frameWidth,
          frameHeight: r.frameHeight
        })
      } else if (resource.type === 'audio') {
        this.load.audio(resource.key, resource.url)
      }
    })
  }

  create() {
    this.registerPlantFrames()
    this.createAnimations()
    this.scene.start('MainMenu')
  }

  private createAnimations(): void {
    DataUtils.getAnimations(this).forEach((anim) => {
      this.anims.create({
        key: anim.key,
        frames: anim.frames
          ? this.anims.generateFrameNumbers(anim.assetKey, { frames: anim.frames })
          : this.anims.generateFrameNumbers(anim.assetKey),
        frameRate: anim.frameRate,
        repeat: anim.repeat
      })
    })
  }

  private registerPlantFrames(): void {
    const plants = this.textures.get('plants')
    const cornFrames: Record<string, [number, number, number, number]> = {
      corn_sprout: [200, 46, 20, 16],
      corn_2: [196, 84, 25, 41],
      corn_3: [194, 129, 28, 62],
      corn_4: [194, 193, 28, 62],
      corn_5: [194, 257, 28, 62],
      corn_harvest: [197, 366, 20, 17]
    }

    Object.entries(cornFrames).forEach(([name, [x, y, width, height]]) => {
      if (!plants.has(name)) {
        plants.add(name, 0, x, y, width, height)
      }
    })
  }
}
