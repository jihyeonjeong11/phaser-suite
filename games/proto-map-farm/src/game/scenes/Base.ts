import { Scene, Types } from "phaser";

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

export class BaseScene extends Scene {
  constructor(config: Types.Scenes.SettingsConfig) {
    super(config);
  }

  init() {
    // declare variables and constants to be referenced in all regular game scenes here with the prefix this
    // e.g. this.foo = 'bar';
    // DO NOT declare listeners to the theatre here with .on, as they will spam in every new scene
  }

  // no create() needed or desirable in the BaseScene, if you want overlay objects use HUD

  nextScene(oldscene: Scene, newscene: Scene, payload: any) {
    this.scene.stop(oldscene);
    this.scene.run(newscene, payload);
  }
}

const theatre = new Phaser.Events.EventEmitter();
export { theatre };

export class HUD extends BaseScene {
  constructor() {
    super({
      key: "hud",
    });
  }

  init() {
    super.init();
  }

  create() {
    // for (let fnc of ["updateScore"]) {
    //   theatre.on(fnc, this[fnc], this);
    // }
    // 그렇다면 카메라 이벤트 fadeout과 fadein 콜백은 어디서?
    // Example of invoking theatre emitter:
    // foo.on("pointerdown", () => theatre.emit('barEvent', payload) );
  }

  hudFocus() {
    this.scene.run("hud");
    this.scene.bringToTop("hud");
  }
  //   updateScore() {
  //     this.score.text = Number(this.score.text) + 1;
  //   }
}
