import { BaseScene } from './Base'
import { theatre } from '../managers/EventEmitter'
import { BaseModal } from '../components/modal/BaseModal'
import { HUD as HudView, HudStats } from '../../gameobjects/hud/HUD'

export class HUD extends BaseScene {
  modal: BaseModal
  private view: HudView

  constructor() {
    super({
      key: 'hud'
    })
  }

  init() {
    super.init()
  }

  create() {
    for (let fnc of [
      /* function names to run via bigtop emitter */
    ]) {
      theatre.on(fnc, this[fnc], this)
    }

    this.modal = new BaseModal(this)
    this.view = new HudView(this)

    theatre.on('modal-inventory', this.modalInventory, this)
    theatre.on('hud-update', this.onHudUpdate, this)
    theatre.on('hud-hide', this.onHudHide, this)

    this.events.once('shutdown', () => {
      theatre.off('modal-inventory', this.modalInventory, this)
      theatre.off('hud-update', this.onHudUpdate, this)
      theatre.off('hud-hide', this.onHudHide, this)
    })

    // HUD display stuff

    // Example of invoking theatre emitter:
    // foo.on("pointerdown", () => theatre.emit('barEvent', payload) );
  }

  onHudUpdate(stats: HudStats) {
    this.view.update(stats)
  }

  onHudHide() {
    this.view.setVisible(false)
  }

  modalInventory() {
    console.log('modalInventory')
    this.modal.openDialog()
  }

  hudFocus() {
    this.scene.launch('hud')
    this.scene.bringToTop('hud')
  }
}
