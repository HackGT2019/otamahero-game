import Phaser, { Scene } from "phaser";
import connorImg from "./assets/fist.png";
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

var score = 0;
var scoreText;
//const PIXPERTICK = .5; //TODO: change to actually pull from music parser file 
const SPEED = 6;
var layerOne;
var layerTwo;
var layerThree;
const OVERLAP = 25;
const WIDTHSCALE = 2; //DON'T CHANGE BROKEN
var canvasWidth;
var canvasHeight;

var game;
var musicParser;
var noteBlocks;
var noteLengths;

let config;

const startButton = document.getElementById('startButton');
startButton.addEventListener("click", startGame);

function startGame() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  musicParser = new MusicParser(despacito, canvasHeight, 500)
  noteBlocks = musicParser.noteBlocks;
  noteLengths = noteBlocks.map((element) => element.width);
  document.getElementById('startBox').remove();
  config = {
    type: Phaser.AUTO,
    parent: "game",
    width: canvasWidth,
    height: canvasHeight,
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
  game = new Phaser.Game(config);
  game.height = config.height;
  game.width = config.width;

}


function preload() {

  this.load.audio("despacito", 'src/assets/audio/despacito/Despacito_NO_VOCALS.mp3');
  this.load.image('connor', connorImg);
  this.load.spritesheet('connor2', connorImg, {frameWidth: 200, frameHeight: 200, startFrame:0, endFrame:1});
  this.load.image('square', squareImg);

  // load background images
  this.load.image('layer-three', 'src/assets/pictures/three.png');
  this.load.image('layer-two', 'src/assets/pictures/two.png');
  this.load.image('layer-one', 'src/assets/pictures/one.png');

  //trying to adjust for variable width scale (BROKEN)
  for (let i = 0; i < noteLengths.length; i++) {
    for (let j = i + 1; j < noteLengths.length; j++) {
      noteBlocks[j].x += (noteLengths[i] * WIDTHSCALE - noteLengths[i]);
    }
  }
  //move absolute positions so it starts later
  for (let i = 0; i < noteLengths.length; i++) {
    noteBlocks[i].x += canvasWidth; // <-- change here
  }
  noteLengths = noteBlocks.map((element) => element.width * WIDTHSCALE);
}

function create() {
  createBackgrounds(this);
  playSong(this);
  makeSoundWrapper();
  hand = this.physics.add.sprite(canvasWidth / 5, canvasHeight / 2, 'connor2').setScale(.25);
  hand.depth = 2;
  cursors = this.input.keyboard.createCursorKeys();
  notes = this.add.group(config);
  scoreText = this.add.text(35, 270, 'score: 0', { fontSize: '20px', fill: '#ffffff', fontFamily: 'Merienda' });

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
  if ((notesArr[notesArr.length - 1].x - 500 + noteLengths[noteCounter]) < canvasWidth) {
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
  const maxHeight = musicParser.playAreaRange[1];

  if (fists != undefined && fists != null && (Math.pow(1.0 - getFistPos(), 2)) <= 1) {
    hand.setPosition(canvasWidth / 5, musicParser.border + musicParser.totalPlaySize * (1- getFistPos()));
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
  music = scene.sound.play("despacito", {volume: 2.5});
}
