import { GameObjects, Scale, Scene } from "phaser";
import {
  DEFAULT_CONFIGS,
  globalConfig,
} from "../../utils/constants/GlobalConfig";
import { ModalBehavoir } from "phaser4-rex-plugins/plugins/modal";

export class Modal {
  scene: Scene;
  constructor(scene: Scene) {
    this.scene = scene;
  }

  public openOptionsModal(): void {
    const scene = this.scene;
    const cx = scene.scale.width / 2;
    const cy = scene.scale.height / 2;

    const panel = scene.add
      .rectangle(0, 0, 420, 300, 0x1e1e1e)
      .setStrokeStyle(2, 0xffffff);
    const heading = scene.add
      .text(0, -120, "Options", {
        fontFamily: "Arial Black",
        fontSize: 26,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const bgmLabel = scene.add
      .text(-150, 0, "BGM", {
        fontFamily: "Arial",
        fontSize: 22,
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);
    const isOn = () => globalConfig.getVolume() > 0;
    const onColor = 0x2d5a34;
    const offColor = 0x5a2d2d;

    const toggleBg = scene.add
      .rectangle(110, 0, 100, 44, isOn() ? onColor : offColor)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const toggleText = scene.add
      .text(110, 0, isOn() ? "ON" : "OFF", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    toggleBg.on("pointerdown", () => {
      const nextVolume = isOn() ? 0 : DEFAULT_CONFIGS.BGM_VOLUME;
      globalConfig.setVolume(nextVolume);
      scene.sound.setVolume(nextVolume);
      toggleText.setText(isOn() ? "ON" : "OFF");
      toggleBg.setFillStyle(isOn() ? onColor : offColor);
    });

    // --- 해상도 선택(단일 선택 체크박스) ---
    const RESOLUTIONS: Array<[string, number, number]> = [
      ["800 x 600", 800, 600],
      ["1024 x 768", 1024, 768],
    ];

    const resBoxes: {
      box: GameObjects.Rectangle;
      check: GameObjects.Text;
      w: number;
      h: number;
    }[] = [];
    const resObjects: GameObjects.GameObject[] = [];

    const isActiveRes = (w: number, h: number) =>
      scene.scale.width === w && scene.scale.height === h;

    // 현재 게임 크기와 일치하는 항목에만 체크 표시(단일 선택).
    const refreshResBoxes = () => {
      resBoxes.forEach((b) => {
        const active = isActiveRes(b.w, b.h);
        b.check.setText(active ? "✓" : "");
        b.box.setFillStyle(active ? onColor : offColor);
      });
    };

    RESOLUTIONS.forEach(([label, w, h], i) => {
      const rowY = 60 + i * 50;
      const rowLabel = scene.add
        .text(-150, rowY, label, {
          fontFamily: "Arial",
          fontSize: 20,
          color: "#ffffff",
        })
        .setOrigin(0, 0.5);
      const box = scene.add
        .rectangle(120, rowY, 34, 34, offColor)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });
      const check = scene.add
        .text(120, rowY, "", {
          fontFamily: "Arial Black",
          fontSize: 22,
          color: "#ffffff",
        })
        .setOrigin(0.5);

      // pointerup 이후 다음 프레임에 리사이즈한다.
      // rex 모달은 커버의 pointerup에서 클릭 좌표가 다이얼로그 밖이면 닫는데,
      // pointerdown~up 사이에 setGameSize가 실행되면 좌표 매핑이 바뀌어
      // 이 클릭이 "바깥 클릭"으로 오인돼 모달이 닫힌다. up 뒤로 미뤄 회피.
      box.on("pointerup", () => {
        scene.time.delayedCall(0, () => {
          scene.scale.setGameSize(w, h);
          globalConfig.setResolution({ width: w, height: h }); // localStorage 저장
          refreshResBoxes();
        });
      });

      resBoxes.push({ box, check, w, h });
      resObjects.push(rowLabel, box, check);
    });
    refreshResBoxes();

    const dialog = scene.add.container(cx, cy, [
      panel,
      heading,
      bgmLabel,
      toggleBg,
      toggleText,
      ...resObjects,
    ]);

    new ModalBehavoir(dialog, {
      cover: { color: 0x000000, alpha: 0.7 },
      touchOutsideClose: true,
      duration: { in: 200, out: 200 },
      transitIn: 1, // fadeIn
      transitOut: 1, // fadeOut
      destroy: true,
    });

    // 해상도 변경 시 다이얼로그를 새 화면 중앙으로 이동(옛 좌표에 남지 않게).
    const recenter = () =>
      dialog.setPosition(scene.scale.width / 2, scene.scale.height / 2);
    scene.scale.on(Scale.Events.RESIZE, recenter);
    // 모달이 닫히며 dialog가 destroy되면 리스너 해제(파괴된 객체 참조 방지).
    dialog.once("destroy", () =>
      scene.scale.off(Scale.Events.RESIZE, recenter),
    );
  }
}
