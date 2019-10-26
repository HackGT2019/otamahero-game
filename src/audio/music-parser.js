import { NoteBlock } from "./note-block";

export class MusicParser {
    get PIXELS_PER_TICK() {
        return .5;
    }

    get NOTE_BLOCK_HEIGHT_PX() {
        return 20;
    }

    constructor(vocalMidi, gameHeight) {
        this.vocalMidi = vocalMidi;
        this.gameHeight = gameHeight;
        if (this.gameHeight == null) {
            this.gameHeight = 300;
        }
        this._processNotesFromTrack(vocalMidi.tracks[0]);
    }

    _processNotesFromTrack(noteEvents) {
        this.extrema = this._getMinAndMax(noteEvents);
        this.yConversionFactor = this._getYConversionFactor(this.gameHeight, this.NOTE_BLOCK_HEIGHT_PX, this.extrema);
        this.noteBlocks = this._generateNoteBlocks(noteEvents);
        console.log(this.noteBlocks);
    }

    _generateNoteBlocks(noteEvents) {
        let currentTime = 0;
        let output = [];
        for (let eventCounter = 0; eventCounter < noteEvents.length; eventCounter += 2) {
            const startEvent = noteEvents[eventCounter];
            const endEvent = noteEvents[eventCounter + 1];
            if (startEvent.noteOn == null || endEvent.noteOff == null) {
                throw new Error('Does not have a noteOn and noteOff event. This suggests corrupted data');
            }
            const note = startEvent.noteOn.noteNumber;

            currentTime += startEvent.delta; // delay before the start
            const startTime = currentTime;
            currentTime += endEvent.delta; // the delay before the end event executes

            let startX = startTime * this.PIXELS_PER_TICK;

            const width = endEvent.delta * this.PIXELS_PER_TICK;
            const x = startX + width / 2; // phaser bases off midpoint
            const y = this._getY(note);
            const height = this.NOTE_BLOCK_HEIGHT_PX;
            output.push(new NoteBlock(x, y, width, height, note, 100));
        }
        return output;
    }

    _getMinAndMax(noteEvents) {
        let min = null;
        let max = null;
        for (let noteCounter = 0; noteCounter < noteEvents.length; noteCounter++) {
            let event = noteEvents[noteCounter];
            event = event.noteOn != null ? event.noteOn : event.noteOff;
            if (min == null || event.noteNumber < min) {
                min = event.noteNumber;
            }
            if (max == null || event.noteNumber > max) {
                max = event.noteNumber;
            }
        }
        return {min, max, range: max - min};
    }

    _getYConversionFactor(gameWindowHeight, noteBlockHeight, noteExtrema) {
        return (gameWindowHeight - noteBlockHeight) / (noteExtrema.range);
    }

    _getY(noteNumber) {
        return ((noteNumber - this.extrema.min) * this.yConversionFactor) + (this.NOTE_BLOCK_HEIGHT_PX / 2); // phaser bases off midpoint
    }

}
