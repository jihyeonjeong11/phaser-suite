// draw hud on bottom like minecraft
// current inventory exists in phaser.registry, with 10 spaces.
// game.ts -> registry -> new inventory
export class Inventory {
  readonly inventory: any[];
  constructor() {
    this.inventory = [];
  }
  get getInventory() {
    return this.inventory;
  }
}
