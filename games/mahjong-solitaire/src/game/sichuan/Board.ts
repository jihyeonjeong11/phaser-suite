import { BOARD_HEIGHT, BOARD_WIDTH, FRAME_LIST } from "../utils/constants";
import { TileType } from "../utils/types";

export class Board {
  private constructor(private grid: (TileType | null)[][]) {}
  static create(): Board {
    const deck = Board.shuffle(Board.buildDeck(FRAME_LIST));

    const grid: TileType[][] = Array.from({ length: BOARD_WIDTH }, () =>
      Array<TileType>(BOARD_HEIGHT),
    );

    let p = 0;
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        grid[col][row] = { col, row, kind: deck[p++] };
      }
    }

    return new Board(grid);
  }

  getTile(col: number, row: number): TileType | null {
    return this.grid[col][row];
  }

  remove(col: number, row: number) {
    this.grid[col][row] = null;
  }

  get tiles(): TileType[] {
    return this.grid.flat().filter((t): t is TileType => t !== null);
  }

  private static buildDeck(kinds: string[]): string[] {
    if (kinds.length === 0) throw new Error("no tile kinds");

    const deck: string[] = [];
    for (const k of kinds) deck.push(k, k);

    const pairsLeft = (BOARD_WIDTH * BOARD_HEIGHT - deck.length) / 2;
    for (let i = 0; i < pairsLeft; i++) {
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      deck.push(k, k);
    }
    return deck;
  }

  private static shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
