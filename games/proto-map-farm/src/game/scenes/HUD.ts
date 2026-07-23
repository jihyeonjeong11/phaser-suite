import { BaseScene } from './Base'
import { theatre } from '../managers/EventEmitter'
import { BaseModal } from '../components/modal/BaseModal'

export class HUD extends BaseScene {
  modal: BaseModal
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

    theatre.on('modal-inventory', this.modalInventory, this)

    // HUD display stuff

    // Example of invoking theatre emitter:
    // foo.on("pointerdown", () => theatre.emit('barEvent', payload) );
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
