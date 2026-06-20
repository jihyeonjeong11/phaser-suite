# 좋은 게임 개발 구조(SOLID)에 대한 고민

> phaser-video-poker(기존 게임)와 five-card-draw(우리 템플릿)를 비교하며
> "재사용 가능하고 SOLID한 Phaser 구조"를 정리한 기록.

---

## 1. 모든 소프트웨어의 뼈대

```
입력(받아옴)  →  처리/변환(규칙 적용)  →  출력(렌더)
   Input            Process               Output
```

- 데이터는 그냥 통과하지 않는다. **규칙에 의해 변형**된다 (가운데 "처리"가 본질).
- 게임은 이 사이클이 **시간 루프(update) + 상호작용(input)** 으로 계속 돈다.
- 이 3단계가 그대로 3레이어가 된다:

| 단계 | 레이어 | 책임 |
|------|--------|------|
| 처리(규칙) | **Model / Domain** | 셔플·딜·족보 판정 (순수 로직) |
| 출력(그리기) | **View** | Phaser GameObject, 화면 표현만 |
| 연결/조율 | **Controller / Scene** | 누가 누구에게 데이터를 흘리는지 |

---

## 2. 레이어별 책임 (핵심)

### Scene (최상위, Phaser 소비)
- 책임: **조립(생성+연결) + 흐름 조율 + render "명령"**
- ❌ **직접 render 하지 않는다.** `add.existing()`은 "화면 목록에 등록"하는 조율일 뿐,
  실제 픽셀은 Phaser 엔진이 매 프레임 자동으로 그린다.
- 비유: **오케스트라 지휘자** — 악기를 나눠주고 신호만 준다. 직접 연주(render)하거나 작곡(규칙)하지 않는다.

### View (GameObject)
- 책임: **그리기만.** 상태(SOT)를 갖지 않는다.
- 모델 상태를 받아 "표시만" 한다 (단방향: Model → View).
- 예) five-card-draw의 `Card`(순수 드로잉 Sprite) = 모범. `setHeld`는 위치만 바꿈.

### Model / Domain
- 책임: 데이터 **그리고** 그 데이터에 작용하는 규칙을 **함께** 가진다 = **풍부한 도메인 모델(rich model)**.
- Phaser를 **한 줄도 import 하지 않는다.** → 단위 테스트 가능, 이식 가능.
- 예) `Deck`(데이터 + shuffle/deal) = 도메인 모델(엔티티).

### State (게임 흐름의 SOT)
- 책임: 게임 흐름 상태머신(phase, 점수, held 등 "지금 어떤 상태인가").
- ⚠️ **naked setter 금지.** 규칙을 강제하는 **의도(intent) 메서드**를 노출하라.
  ```ts
  // ❌ state.phase = 'drawing'  (규칙이 밖으로 샘 → 빈혈 모델)
  // ✅ state.toggleHold(i) { if (phase !== 'holding') return; ... }  (규칙은 내부에서 강제)
  ```
- getter는 읽기 전용으로 OK, setter는 의도 메서드로 대체.

---

## 3. 가장 중요한 원칙: 의존 방향

```
Phaser  →  Domain/Model   (O)   항상 이 방향
Domain  →  Phaser         (X)   절대 금지
```

- **DIP(의존 역전):** core(modules/state/utils/config)는 Phaser를 모른다.
- 검증선: **`modules` / `state` / `config` / `utils`가 `phaser`를 import 하면 실패.**
  이게 지켜지면 계층이 진짜 나뉜 것.

---

## 4. 베스트 패턴 요약

> **Headless Core + Phaser를 얇은 어댑터로 + Event-driven + Composition**

- **Headless Core**: 게임 규칙은 Phaser 독립 → 테스트/이식/재사용 가능.
- **Port & Adapter**: core가 인터페이스(`IAudio` 등)를 정의, Phaser가 구현.
- **Event-driven**: 직접 호출 대신 EventBus로 `emit/subscribe`.
  - 컨트롤러(역할)를 없애는 게 아니라 **조율을 이벤트로 분산**.
  - 장점: OCP(구독자 추가 시 기존 코드 무수정), DIP(모델이 뷰를 모름).
  - 대가: 흐름이 암묵적 → 추적/디버깅 어려움. 작은 게임엔 과할 수 있음.
- **Composition over inheritance**: 행동은 상속 트리가 아니라 컴포넌트로 부착.

### 컨트롤러 vs 이벤트 드리븐 (헷갈리지 말 것)
| | 컨트롤러 | 이벤트 드리븐 |
|---|---------|--------------|
| 무엇 | **역할** — 누가 조율하는가 | **방식** — 어떻게 소통하는가 |
- 이벤트 드리븐은 컨트롤러의 조율 책임을 **구현하는 한 방식**.

---

## 5. 두 게임 비교 (실제 진단)

### phaser-video-poker
- ✅ **도메인 분리는 잘 됨**: `services/PokerGame.ts`(족보·딜)가 Phaser 무관 + `*.spec.ts` 단위 테스트 보유.
- ❌ **조율 계층이 무너짐**:
  - `GameScene.ts` = **789줄 갓 오브젝트** (상태머신 + UI + 연출 + 오디오 다 떠안음, SRP 위반).
  - SOT가 **타입 없는 전역 `registry`** 에 흩어짐 (`registry.set('state'/'money'/'bet')`, `data: any`).
  - `components/` 폴더가 **도메인+뷰+컨트롤러를 한데 섞음**.
  - 도메인 `Card`가 뷰 `CardSprite` 안에 숨음 → `slot.card.card` 로 접근(의존 역전 위반).
- 판정: **부분적으로 클린** — 어려운 도메인은 성공, 쉬운 폴더/씬 분리에서 실패.

### five-card-draw (우리 템플릿)
- ✅ 모델/뷰 분리 의도가 명확 (`Card` = 순수 드로잉, `Hand` 주석에 SOT 명시).
- ⚠️ `Deck`·`States`가 **`gameobjects/` 폴더에 잘못 위치** (순수 로직인데 "화면객체"라 거짓말).
- ⚠️ `Hand` = Container(뷰) + SOT + 입력배선 **세 책임 혼재** (video-poker `CardSlot`과 같은 냄새).
- ⚠️ `types.ts`에 타입 + 도메인 데이터(`SUITS`,`CARD_VALUES`) 혼재.

> **교훈: 폴더 이름은 "이건 무엇이다"라는 선언이다.**
> 어떤 파일을 어디 둘지 망설여지면 = 그 파일이 책임을 두 개 갖고 있다는 신호.

---

## 6. 확정된 폴더 구조 (five-card-draw)

```
src/
  scenes/       Phaser 소비 + 조립 + render 명령
  gameObjects/  그리기 (GameObject 상속)
  events/       EventBus + 이벤트 타입 (조율을 분산)
  modules/      도메인 규칙·엔티티 (Deck, 족보평가)
  state/        게임 흐름 상태머신 (GameState)
  config/       정적 설정·옵션 (볼륨 등)
  utils/        타입·순수 헬퍼 (types, cardFrame)
```

### 폴더 = 책임 선언 + Phaser 의존 규칙
| 폴더 | 책임 | Phaser |
|------|------|:---:|
| `scenes` | 조립·흐름·render 명령 | ✅ 소비 |
| `gameObjects` | 그리기 (Sprite/Container 상속) | ✅ 상속 |
| `events` | emit/subscribe로 연결 | 무관(보통 순수) |
| `modules` | 도메인 규칙·엔티티 | ❌ 금지 |
| `state` | 게임 흐름 SOT/상태머신 | ❌ 금지 |
| `config` | 정적 설정 | ❌ 금지 |
| `utils` | 타입·헬퍼 | ❌ 금지 |

### modules vs state 경계 규칙
- `modules` = **규칙/계산** (Deck 셔플·딜, 족보 판정).
- `state` = **지금 게임이 어떤 상태인가** (phase, 점수, held).
- 기준 한 줄: "세션 전체의 흐름을 대표하느냐" → 그렇다면 state, 아니면 modules.

---

## 7. 결정 사항 & 남은 일

### 결정됨
- 폴더 7개 구조 확정 + 생성 완료(.gitkeep).
- 조율은 **이벤트 드리븐**으로 (`controllers/` 안 만듦, `events/` 사용).
- `config`는 새로 생성(게임 옵션용). `options` 폴더는 안 만듦(YAGNI).
- `Hand` 분리는 **나중에** (현재 보류).

### 다음 단계 (미진행)
1. 파일 이동: `game/scenes/*`→`scenes/`, `game/gameobjects/{Card,Hand}`→`gameObjects/`,
   `Deck`→`modules/`, `States`→`state/`. import 경로 수정.
2. `Hand`를 `HandState`(state/modules) + `HandView`(gameObjects)로 분리할지 결정.
3. `GameState`를 naked setter → 의도 메서드로.
4. SOT를 registry류 전역이 아니라 `state`의 타입 모델로.
5. 빈 폴더 `.gitkeep` 제거, 빈 `game/` 삭제.

### 검증 체크리스트
- [ ] `modules`/`state`/`config`/`utils`가 `phaser`를 import하지 않는다.
- [ ] View가 SOT를 갖지 않는다 (모델을 받아 표시만).
- [ ] Scene이 직접 render 로직을 갖지 않는다 (조립·명령만).
- [ ] 어떤 파일이 두 폴더 사이에서 망설여지지 않는다 (= 책임이 하나).
