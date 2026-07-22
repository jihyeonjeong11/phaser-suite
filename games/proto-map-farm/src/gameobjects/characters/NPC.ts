import { Character } from './Character'

// npc는 플레이어와는 다르게 ai로 이동함.
// 적의 경우 2가지 행동양식이 있음.
// 1. stalk 인식 범위 내 플레이어 진입 시 실시간으로 플레이어를 통해 이동
// 2. wander 인식 범위 내 플레이어 없을 경우, 1초의 시간 동안 랜덤 방향으로 한 타일 이동, 1초 idle
export class NPC extends Character {}
