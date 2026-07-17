// todo: need to be json afterwards
// 참고: 스타듀밸리 Crop.cs 모델 축소판
//   currentPhase      → stage index (아래 stages 배열의 인덱스)
//   dayOfCurrentPhase → daysInStage (MapObject의 tile state에 저장)
//   phaseDays         → stages[i].days (해당 stage에 머무는 일수, watered일 때만 카운트)
//   regrowAfterHarvest → regrowDays (없으면 1회성 수확 후 제거)
//
// plants.png는 32px 셀 그리드지만, 다 자란 옥수수처럼 세로로 여러 셀을 침범하는 그림은
// 단순 spritesheet(고정 그리드) 슬라이싱으로는 한 프레임에 온전히 담을 수 없다.
// 그래서 Preloader.registerPlantFrames()가 실제 bbox로 등록해둔 named frame을 쓴다.
export const TEMP_CROPS = {
  corn: {
    name: 'corn',
    seedItem: 'seed_corn', // items.ts의 TEMP_ITEMS 키와 매칭
    harvestItem: 'crop_corn', // items.ts의 TEMP_ITEMS 키와 매칭 (수확물)
    textureKey: 'plants',
    stageDays: 0, // 날짜 지날때 watered라면 여기 더하기.
    stages: [
      { frame: 'corn_sprout', days: 1 },
      { frame: 'corn_3', days: 1 },
      { frame: 'corn_harvest', days: 1 }
    ], //
    regrowDays: undefined as number | undefined
  }
} as const

export type CropKey = keyof typeof TEMP_CROPS
export type CropDef = (typeof TEMP_CROPS)[CropKey]
