import Phaser, { Scene } from "phaser";
import connorImg from "./assets/connor.jpg";
import squareImg from "./assets/square.png";
import despacito from './assets/audio/despacito/despacito';
import {MusicParser} from "./audio/music-parser";
import {makeSoundWrapper} from "./makeSound.js";

var hand;
var cursors;
var notes;
var music;
var overlapping = false;
var clock = 0;
var noteCounter = 0;
var doneWithNotes = false;
var layerOne;
var layerTwo;
var layerThree;
const SPEED = 1;
const OVERLAP = 10;
const WIDTHSCALE = 1; //DON'T CHANGE BROKEN
var noteBlocks = new MusicParser(despacito).noteBlocks;
var noteLengths = noteBlocks.map((element) => element.width * WIDTHSCALE);

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


const game = new Phaser.Game(config);
game.height = config.height;
game.width = config.width;

function preload() {

  this.load.audio("despacito", 'src/assets/audio/despacito/Despacito_NO_VOCALS.mp3');
  this.load.image('connor', connorImg);
  this.load.spritesheet('connor2', connorImg, {frameWidth: 141, frameHeight: 188, startFrame:0, endFrame:1});
  this.load.image('square', squareImg);

  // load background images
  this.load.image('layer-three', 'src/assets/pictures/three.png');
  this.load.image('layer-two', 'src/assets/pictures/two.png');
  this.load.image('layer-one', 'src/assets/pictures/one.png');

  //trying to adjust for variable width scale (BROKEN)
  for (let i = 0; i < noteLengths.length; i++) {
    for (let j = i + 1; j < noteLengths.length; j++) {
      //noteBlocks[j].x += ((noteLengths[i] / 2) * WIDTHSCALE);
    }
  }
}

function create() {
  createBackgrounds(this);
  playSong(this);
  makeSoundWrapper();
  hand = this.physics.add.sprite(400, 150, 'connor2').setScale(.25);
  hand.depth = 2;
  cursors = this.input.keyboard.createCursorKeys();
  notes = this.add.group(config);

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

function createBackgrounds(stage) {
  //Set the games background colour
  stage.cameras.main.setBackgroundColor('#697e96');
  const imageThree = stage.textures.get('layer-three').getSourceImage();
  const imageTwo = stage.textures.get('layer-two').getSourceImage();
  const imageOne = stage.textures.get('layer-one').getSourceImage();


  layerThree = stage.add.tileSprite(game.width / 2,
      game.height - imageThree.height / 2,
      game.width,
      imageThree.height,
      'layer-three'
  );

  layerTwo = stage.add.tileSprite(game.width / 2,
      game.height - imageTwo.height / 2,
      game.width,
      imageTwo.height,
      'layer-two'
  );

  layerOne = stage.add.tileSprite(game.width / 2,
      game.height - imageOne.height / 2,
      game.width,
      imageOne.height,
      'layer-one'
  );
}

function update() {
  updateBackgrounds();

  let notesArr = notes.getChildren();
  clock += SPEED;
  if ((notesArr[notesArr.length - 1].x - 500 + noteLengths[noteCounter]) < 810) {
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

    if (Math.abs(hand.y - notesArr[i].y) < OVERLAP && Math.abs(hand.x - (notesArr[i].x - (500 - noteLengths / 2))) < noteLengths / 2) {
      //play overlap animation
      overlapping = true;
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

function updateBackgrounds() {
  layerThree.tilePositionX += 0.05;
  layerTwo.tilePositionX += 0.3;
  layerOne.tilePositionX += 0.75;
}

function playSong(scene) {
  if (music != null) {
    music.stop();
  }
  music = scene.sound.play("despacito");
}
