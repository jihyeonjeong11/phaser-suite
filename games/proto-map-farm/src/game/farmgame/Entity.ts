export class Entity {
  isPlayer!: boolean;
  isPlant!: boolean;
  private readonly BASE_SPEED = 150;
  private readonly BASE_SCALE = 2;

  constuctor(isPlayer: boolean, isPlant: boolean) {
    if (isPlayer) this.isPlayer = true;
    if (isPlant) this.isPlant = true;
  }
}
