import Tone from "tone";

export function makeSoundWrapper() {
  let synth = new Tone.Synth().toMaster();
  //infinite loop w/ set time
  let tid = setTimeout(makeSound(true, 0.3), 0);
  function makeSound(mouthOpen, position) {
    if (mouthOpen) {
          let highFrequency = 1046.50;
          let lowFrequency = 	261.63;
          let tone = ((highFrequency - lowFrequency) * position) + lowFrequency;
          //create a synth and connect it to the master output (your speakers)
          let synth = new Tone.Synth().toMaster();
  
          //play a middle 'C' for the duration of an 8th note
          synth.triggerAttackRelease(tone, 0.1);
    }
    
    tid = setTimeout(() => {
      makeSound(true, 0.3)
    }, 100); // repeat myself
  }
  function abortTimer() { // to be called when you want to stop the timer
    clearInterval(tid);
  }
  
  synth.triggerAttackRelease(0, 300);
  let tid = setTimeout(changeSound(true, 0.3), 0);
  function changeSound(mouthOpen, position) {
    if (mouthOpen) {
      let highFrequency = 1046.50;
      let lowFrequency = 	261.63;
      let tone = ((highFrequency - lowFrequency) * position) + lowFrequency;
      synth.setNote(tone);
    } else {
      synth.setNote(0);
    }
    let aVariable = 5;
    tid = setTimeout(() => {
      changeSound(aVariable, 0.3)
      aVariable = 2;
    }, 100); // repeat myself
  }
}
