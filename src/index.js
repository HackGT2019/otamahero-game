import Phaser, { Scene } from "phaser";
import logoImg from "./assets/connor.jpg";
import despacito from './assets/audio/despacito/despacito';
import {MusicParser} from "./audio/music-parser";

var hand;
var cursors;
var notes;
const SPEED = 2;
const OVERLAP = 10;

new MusicParser(despacito);

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 800,
  height: 300,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:0},
      debug: false
    }
  }
};

//var scene = new Scene(config);

const game = new Phaser.Game(config);

function preload() {
  this.load.image('connor', logoImg);
  this.load.spritesheet('connor2', logoImg, {frameWidth: 141, frameHeight: 188, startFrame:0, endFrame:1});
  //this.load.audio("despacito", 'src/assets/audio/despacito/wav_despacito_NO_VOCALS.wav');  // urls: an array of file url

}

function create() {
  hand = this.physics.add.sprite(400, 150, 'connor2').setScale(.25);
  hand.depth = 2;
  cursors = this.input.keyboard.createCursorKeys();
  notes = this.add.group(config);
  notes.create(800, 200, "connor");
  notes.depth = 1;
  this.anims.create({
    key: 'notOverlap',
    //frames: [ {key: 'connor2', frame : 0 } ],
    frames: [ { key: 'connor2', frame: 0 } ],
    frameRate: 20,
  });
  this.anims.create({
    key: 'overlap',
    frames: [ {key: 'connor2', frame : 1 } ],
    frameRate: 20,
  });

  //this.sound.add('despacito');
  //this.sound.play('despacito');
}

function update() {
  let notesArr = notes.getChildren();
  for (let i = 0; i < notesArr.length; i++) {
    notesArr[i].setPosition(notesArr[i].x - SPEED, notesArr[i].y);
    console.log(hand.anims.isPlaying);
    if (Math.abs(hand.y - notesArr[i].y) < OVERLAP && Math.abs(hand.x - notesArr[i].x) < notesArr[i].width / 2) {
      //play overlap animation
      this.anims.play('overlap',hand);
    } else {
      this.anims.play('notOverlap',hand);
    }
    if (notesArr[i].x + (notesArr[i].width / 2) < 0) {
      notes.remove(notesArr[i], true, true);
    }
  }
  //moving hand up and down
  if (fists != undefined && fists != null && getFistPos() != -1) {
    hand.setPosition(400, 300 * (1- getFistPos()));
  } else {
    hand.setPosition(400, 150);
  }
}
