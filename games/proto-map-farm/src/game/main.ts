import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game, Scale } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { HUD } from "./scenes/Base";
import { globalConfig } from "./utils/constants/GlobalConfig";

const { width, height } = globalConfig.getResolution();

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  scale: {
    width,
    height,
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
  },
  parent: "game-container",
  backgroundColor: "#028af8",
  zoom: 1,
  pixelArt: true,
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver, HUD],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0, x: 0 },
    },
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
