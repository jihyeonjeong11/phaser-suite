## 1. More mini-games phaser + typescript https://github.com/phaserjs/template-vite-ts

- create GameScene
  - Folder Structure + constants + type
  - Miner + hook assets + rendering
  - Hook instance 1
    - pendulum anim
    - firing
    - reeling
  - Minable Objects

  - Hook class 2
    - collision
    - catching

  - Scoring
  - Dynamite
  - Randomized mine generation

-

## 2. An Electron Wrapper for executables https://github.com/digitsensitive/phaser3-electron

## 3. An Showcase app, loaded as webview. - see https://phaser.io/create phaser desktop app.

## 4. Mobile? electron for mobile?

## 5. A Game I want to build! Maybe builing with GODOT?

{
"name": "gold-miner",
"description": "A clone project of the classic Gold Miner game, built with Phaser 4 and Vite.",
"version": "1.0.0-prototype",
"type": "module",
"repository": {
"type": "git",
"url": "git+https://github.com/phaserjs/template-vite.git"
},
"author": "JIHYEON JEONG",
"license": "MIT",
"licenseUrl": "http://www.opensource.org/licenses/mit-license.php",
"bugs": {
"url": "https://github.com/phaserjs/template-vite/issues"
},
"homepage": "https://github.com/phaserjs/template-vite#readme",
"scripts": {
"dev": "node log.js dev & vite --config vite/config.dev.mjs",
"build": "node log.js build & vite build --config vite/config.prod.mjs",
"dev-nolog": "vite --config vite/config.dev.mjs",
"build-nolog": "vite build --config vite/config.prod.mjs"
},
"devDependencies": {
"terser": "^5.39.0",
"vite": "^6.3.1"
},
"dependencies": {
"phaser": "4.0.0"
}
}
