import Tone from "tone";

export function makeSoundWrapper(getPositionFunction, musicPlayer) {
  
  let synth = new Tone.Synth().toMaster();
  Tone.context.resume();
  synth.triggerAttackRelease(0, 300);
  let tid = setTimeout(changeSound(false, 0), 0);
  let lastTone = 0;
  function changeSound(mouthOpen, position) {
    Tone.context.resume();
    if (mouthOpen && position >= 0) {
      let lowFrequency = 	noteToFrequency(musicPlayer.extrema.min); //261.63 for despacito
      let highFrequency = noteToFrequency(musicPlayer.extrema.max); //1046.50 for despacito;
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

function noteToFrequency(note) {
  const a = 440;
  return (a / 32) * (2 ** ((note - 9) / 12));
}
