import { Scene, Types } from 'phaser'
import { Controls } from '../utils/controls'

// goal: complete lifecycle for phaser game scene, registry ingame event emission and scene trasitions
// 1. preloader.ts -> loads initial registry, after expand to save/load feature
// 2. Base.ts
// 3. class HUD
// 4. children Scenes(home, game, ruin, etc)
// 5. starting objects(player, npc, etc) and their interactions

// things to consider:
//- emitter ingame events -> changes registry -> needs to be handled by HUD,
//  but can i get value as parameter from children?

// - scene transition events -> cameraEvent fadeout/fadein
// can i declare events in HUD or base.ts?     this.scene.stop(oldscene); this destroys all objects in oldscene?

// refs https://www.ticklemonster.com.au/2023/07/18/basescene-hud-and-event-emitter-file-structure-in-phaser-3-60/

// todo: controls
export abstract class BaseScene extends Scene {
  _controls!: Controls
  constructor(config: Types.Scenes.SettingsConfig) {
    super(config)
  }

  init(data: unknown) {
    // declare variables and constants to be referenced in all regular game scenes here with the prefix this
    // e.g. this.foo = 'bar';
    // DO NOT declare listeners to the theatre here with .on, as they will spam in every new scene
    if (data) {
      this._log(`[${this.constructor.name}:init] invoked, data provided: ${JSON.stringify(data)}`)
      return
    }
    this._log(`[${this.constructor.name}:init] invoked`)
  }

  create() {
    this._controls = new Controls(this)
    //this._log(`[${this.constructor.name}:create] invoked`);
  }
  // nextScene(oldscene: Scene, newscene: Scene, payload: unknown) {
  //   this.scene.stop(oldscene)
  //   this.scene.run(newscene, payload)
  // }
  _log(message: string) {
    console.log(`%c${message}`, 'color: orange; background: black;')
  }
}
