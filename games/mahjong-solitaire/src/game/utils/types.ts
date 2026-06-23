export type TileType = { col: number; row: number; kind: string | null };

// 경로 표시용 격자 좌표(끝점·코너). col/row가 -1 또는 보드 크기일 수 있다(테두리 우회).
export type GridPos = { col: number; row: number };
