import { BOARD_HEIGHT, BOARD_WIDTH } from "../utils/constants";
import { GridPos, TileType } from "../utils/types";
import { Board } from "./Board";

/*
 * learnt from https://github.com/KDE/kshisen/blob/master/src/board.cpp#L1771
 * Straight: no turn; check a single line, either vertical or horizontal.
 * Single-turn: check one line, then the corner, then another line.
 * Two-turn: use a for loop to scan all candidates — line, corner, line, corner, line.
 */

export class SichuanGame {
  currentBoard = Board.create();

  public match(first: TileType, second: TileType): GridPos[] | null {
    if (first.col === second.col && first.row === second.row) return null;
    if (first.kind !== second.kind || first.kind === null) return null;

    return (
      this.connectStraight(first, second) ||
      this.connectOneTurn(first, second) ||
      this.connectTwoTurn(first, second)
    );
  }

  private connectStraight(a: TileType, b: TileType): GridPos[] | null {
    if (a.row === b.row && this.isHorizontalClear(a.row, a.col, b.col)) {
      return [this.pos(a), this.pos(b)];
    }
    if (a.col === b.col && this.isVerticalClear(a.col, a.row, b.row)) {
      return [this.pos(a), this.pos(b)];
    }
    return null;
  }

  private connectOneTurn(a: TileType, b: TileType): GridPos[] | null {
    if (
      this.isVerticalClear(a.col, a.row, b.row) &&
      this.passable(a.col, b.row) &&
      this.isHorizontalClear(b.row, a.col, b.col)
    ) {
      return [this.pos(a), { col: a.col, row: b.row }, this.pos(b)];
    }
    if (
      this.isHorizontalClear(a.row, a.col, b.col) &&
      this.passable(b.col, a.row) &&
      this.isVerticalClear(b.col, a.row, b.row)
    ) {
      return [this.pos(a), { col: b.col, row: a.row }, this.pos(b)];
    }
    return null;
  }

  private connectTwoTurn(a: TileType, b: TileType): GridPos[] | null {
    for (let x = -1; x <= BOARD_WIDTH; x++) {
      if (x === a.col || x === b.col) continue;
      if (
        this.isHorizontalClear(a.row, a.col, x) &&
        this.passable(x, a.row) &&
        this.isVerticalClear(x, a.row, b.row) &&
        this.passable(x, b.row) &&
        this.isHorizontalClear(b.row, x, b.col)
      ) {
        return [
          this.pos(a),
          { col: x, row: a.row },
          { col: x, row: b.row },
          this.pos(b),
        ];
      }
    }
    for (let y = -1; y <= BOARD_HEIGHT; y++) {
      if (y === a.row || y === b.row) continue;
      if (
        this.isVerticalClear(a.col, a.row, y) &&
        this.passable(a.col, y) &&
        this.isHorizontalClear(y, a.col, b.col) &&
        this.passable(b.col, y) &&
        this.isVerticalClear(b.col, y, b.row)
      ) {
        return [
          this.pos(a),
          { col: a.col, row: y },
          { col: b.col, row: y },
          this.pos(b),
        ];
      }
    }
    return null;
  }

  /** Check if the move is made from the outside of grid */
  private isWithinPathGrid(col: number, row: number): boolean {
    return col >= -1 && col <= BOARD_WIDTH && row >= -1 && row <= BOARD_HEIGHT;
  }

  /** Check if the move is made from the edge of grid.  */
  private isOutlineCell(col: number, row: number): boolean {
    return col < 0 || col >= BOARD_WIDTH || row < 0 || row >= BOARD_HEIGHT;
  }

  private passable(col: number, row: number): boolean {
    if (!this.isWithinPathGrid(col, row)) return false;
    if (this.isOutlineCell(col, row)) return true;
    return this.currentBoard.getTile(col, row) === null;
  }

  private isHorizontalClear(row: number, c1: number, c2: number): boolean {
    const low = Math.min(c1, c2);
    const high = Math.max(c1, c2);
    for (let c = low + 1; c < high; c++) {
      if (!this.passable(c, row)) return false;
    }
    return true;
  }

  private isVerticalClear(col: number, r1: number, r2: number): boolean {
    const low = Math.min(r1, r2);
    const high = Math.max(r1, r2);
    for (let r = low + 1; r < high; r++) {
      if (!this.passable(col, r)) return false;
    }
    return true;
  }

  private pos(t: TileType): GridPos {
    return { col: t.col, row: t.row };
  }

  public removePair(first: TileType, second: TileType): void {
    this.currentBoard.remove(first.col, first.row);
    this.currentBoard.remove(second.col, second.row);
  }

  public getRemovedPairs(): number {
    const remaining = this.currentBoard.tiles.length;
    return (BOARD_WIDTH * BOARD_HEIGHT - remaining) / 2;
  }

  /** 지금 제거 가능한 쌍의 개수. kind별로 묶어 같은 종류끼리만, 각 쌍을 한 번씩(j>i) 검사. */
  public countAllMatches(): number {
    const byKind = new Map<string, TileType[]>();
    for (const t of this.currentBoard.tiles) {
      if (t.kind === null) continue;
      const group = byKind.get(t.kind);
      if (group) group.push(t);
      else byKind.set(t.kind, [t]);
    }

    let count = 0;
    for (const group of byKind.values()) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          if (this.match(group[i], group[j])) count++;
        }
      }
    }
    return count;
  }
}
