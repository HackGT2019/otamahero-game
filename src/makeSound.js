import Tone from "tone";

export function makeSoundWrapper(getPositionFunction) {
  
  let synth = new Tone.Synth().toMaster();
  Tone.context.resume();
  synth.triggerAttackRelease(0, 300);
  let tid = setTimeout(changeSound(false, 0), 0);
  let lastTone = 0;
  function changeSound(mouthOpen, position) {
    Tone.context.resume();
    if (mouthOpen && position >= 0) {
      console.log(position);
      let highFrequency = 1046.50;
      let lowFrequency = 	261.63;
      let tone = ((highFrequency - lowFrequency) * position) + lowFrequency;
      lastTone = tone;
      synth.setNote(tone);
    } else if (mouthOpen) {
      synth.setNote(lastTone);
    } else {
      synth.setNote(0);
    }


    tid = setTimeout(() => {
      changeSound(getMouth(), getPositionFunction())
    }, 10); // repeat myself
  }
}

