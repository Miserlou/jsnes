/*global MIDI SCRIPT_ROOT nes*/

var scale = [0,2,4,7,9,12,14,16,19,21,24,26,28,31];
var voices = {
    'brick': 'taiko_drum',
    'goomba': 'ocarina',
    'chocolate_block': 'glockenspiel',
    'pipe': 'tuba',
    'question': 'tubular_bells',
    // 'question': 'tinkle_bell',
    'turtle': 'choir_aahs',
    'mushroom': 'oboe',
    'star_flag': 'blown_bottle',
    'peace_flag': 'blown_bottle',
    'star': 'blown_bottle'
}
var midi_started = false;

function playNoteFor(type, distance, height) {
    var instrument = voices[type],
        note = 60 + scale[14 - height];
    var volume = distance === 0 ? 127 : 40;
    MIDI.programChange(0, MIDI.GeneralMIDI.byName[instrument].number);
    MIDI.noteOn(0, note, volume);
    MIDI.noteOff(0, note);
}

$(function() {
    var instruments = [];
    for (var voice in voices) {
        if (voices.hasOwnProperty(voice)) {
            instruments.push(voices[voice]);
        }
    }
    MIDI.loadPlugin({
        soundfontUrl: SCRIPT_ROOT + "/static/soundfonts/FluidR3_GM/",
        instruments: instruments,
        callback: function() {
            midi_started = true;
            window.MIDI = MIDI;
            MIDI.setVolume(0, 127);

            nes.keyboard.setKey(13, 0x41);
            var audio = document.getElementById("theme");
            setTimeout(function() {
                audio.play();
            }, 4000);
            $('.nes-screen').attr('tabIndex', 0).focus();

        }
    });


});
