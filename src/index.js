import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import {makeSoundWrapper} from "./makeSound.js";
const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("logo", logoImg);
  this.load.audio("despacito", 'src/assets/audio/despacito/wav_despacito_NO_VOCALS.wav');  // urls: an array of file url

}

function create() {
  makeSoundWrapper();
  const logo = this.add.image(400, 150, "logo");
  this.sound.add('despacito');
  this.tweens.add({
    targets: logo,
    y: 450,
    duration: 2000,
    ease: "Power2",
    yoyo: true,
    loop: -1
  });
  this.sound.play('despacito');
}
