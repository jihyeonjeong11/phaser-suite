import { Scene, Scenes, Types } from "phaser";
import { QuickBar } from "../../gameobjects/hud/QuickBar";
//import { theatre } from "../dataManager/EventEmitter";
import { Controls } from "../utils/controls";

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
  _controls!: Controls;
  constructor(config: Types.Scenes.SettingsConfig) {
    super(config);
    if (this.constructor === BaseScene) {
      throw new Error(
        "BaseScene is an abstract class and cannot be instantiated.",
      );
    }
  }

  init() {
    // declare variables and constants to be referenced in all regular game scenes here with the prefix this
    // e.g. this.foo = 'bar';
    // DO NOT declare listeners to the theatre here with .on, as they will spam in every new scene
  }

  create() {
    this._controls = new Controls(this);
    //this._log(`[${this.constructor.name}:create] invoked`);
    this.scene.bringToTop();
  }

  // no create() needed or desirable in the BaseScene, if you want overlay objects use HUD

  nextScene(oldscene: Scene, newscene: Scene, payload: any) {
    this.scene.stop(oldscene);
    this.scene.run(newscene, payload);
  }
}

export class HUD extends BaseScene {
  quickBar: QuickBar;

  constructor() {
    super({
      key: "hud",
    });
  }

  init() {
    super.init();
  }

  create() {
    this.quickBar = new QuickBar(this);
    this.events.on(Scenes.Events.SHUTDOWN, () => {
      console.log("HUD scene shutdown");
    });
    // for (let fnc of ["hudFocus"]) {
    //   theatre.on(fnc, this[fnc], this);
    // }
    // 그렇다면 카메라 이벤트 fadeout과 fadein 콜백은 어디서?
    // Example of invoking theatre emitter:
    // foo.on("pointerdown", () => theatre.emit('barEvent', payload) );
  }

  hudFocus() {
    this.scene.run("hud");
    this.scene.bringToTop("hud");
    console.log(123);
    this.quickBar = new QuickBar(this);
  }
  //   updateScore() {
  //     this.score.text = Number(this.score.text) + 1;
  //   }
}
