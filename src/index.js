import Phaser, { Scene } from "phaser";
import connorImg from "./assets/connor.jpg";
import squareImg from "./assets/square.png";
import despacito from './assets/audio/despacito/despacito';
import {MusicParser} from "./audio/music-parser";
import {makeSoundWrapper} from "./makeSound.js";

var hand;
var cursors;
var notes;
var overlapping = false;
var clock = 0;
var noteCounter = 0;
var doneWithNotes = false;
var score = 0;
var scoreText;

const SPEED = 10;
const OVERLAP = 10;
const WIDTHSCALE = 2; //DON'T CHANGE BROKEN
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 300;

var noteBlocks = new MusicParser(despacito).noteBlocks;
var noteLengths = noteBlocks.map((element) => element.width);

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
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


const game = new Phaser.Game(config);

function preload() {
  this.load.image('connor', connorImg);
  this.load.spritesheet('connor2', connorImg, {frameWidth: 141, frameHeight: 188, startFrame:0, endFrame:1});
  this.load.image('square', squareImg);

  //trying to adjust for variable width scale (BROKEN)
  for (let i = 0; i < noteLengths.length; i++) {
    for (let j = i + 1; j < noteLengths.length; j++) {
      noteBlocks[j].x += (noteLengths[i] * WIDTHSCALE - noteLengths[i]);
    }
  }
  noteLengths = noteBlocks.map((element) => element.width * WIDTHSCALE);
}

function create() {
  makeSoundWrapper();
  hand = this.physics.add.sprite(400, 150, 'connor2').setScale(.25);
  hand.depth = 2;
  cursors = this.input.keyboard.createCursorKeys();
  notes = this.add.group(config);
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#ffffff' });

  notes.create(noteBlocks[noteCounter].x + 500 - noteLengths[noteCounter] / 2, noteBlocks[noteCounter].y, 'square').setCrop(0,0,noteLengths[noteCounter],25);
 

  notes.depth = 1;
  this.anims.create({
    key: 'notOverlap',
    frames: [ { key: 'connor2', frame: 0 } ],
    frameRate: 20,
  });
  this.anims.create({
    key: 'overlap',
    frames: [ {key: 'connor2', frame : 1 } ],
    frameRate: 20,
  });

}

function update() {
  let notesArr = notes.getChildren();
  clock += SPEED;
  if ((notesArr[notesArr.length - 1].x - 500 + noteLengths[noteCounter]) < CANVAS_WIDTH) {
    noteCounter++;
    if (noteCounter >= noteLengths.length) {
      doneWithNotes = true;
    }

    if (!doneWithNotes) {
      notes.create(noteBlocks[noteCounter].x + 500 - noteLengths[noteCounter] / 2 - clock, noteBlocks[noteCounter].y, 'square').setCrop(0,0,noteLengths[noteCounter],25);
    }
  }

  //all overlapping stuff (COMPLETE)
  for (let i = 0; i < notesArr.length; i++) {
    notesArr[i].setPosition(notesArr[i].x - SPEED, notesArr[i].y);
    if (Math.abs(hand.y - notesArr[i].y) < OVERLAP && Math.abs(hand.x - (notesArr[i].x - (500 - noteLengths[noteCounter - notesArr.length + i] / 2))) < noteLengths[noteCounter - notesArr.length + i] / 2) {
      //play overlap animation
      overlapping = true;
      console.log("overlapping");
    }
    if (notesArr[i].x + (notesArr[i].width / 2) < 0) { //this doesn't quite delete right away
      notes.remove(notesArr[i], true, true);
      if (doneWithNotes && notesArr.length === 0) {
        game.destroy();
      }
    }
  }
  if (overlapping) {
    this.anims.play('overlap',hand);
    score += SPEED;
    scoreText.setText('Score: ' + score);
  } else {
    this.anims.play('notOverlap',hand);
  }
  overlapping = false;
  //moving hand up and down
  if (fists != undefined && fists != null && getFistPos() != -1) {
    hand.setPosition(400, 300 * (1- getFistPos()));
  } else {
    hand.setPosition(400, 150);
  }
}
