/*global T playNoteFor midi_started*/
// Dynamic objects are represented as synthesizers.
var synths = {
    'goomba': [],
    'mushroom': [],
    'brick': [],
    'turtle': [],
    'hole': [],
    'chocolate_block': []
};

var started = false;
var mario = {'x': 0, 'y': 0};

var RATIOS = ["1/1", "9/8", "5/4", "4/3", "3/2", "5/3", "7/4", "2/1"],
    BASE_FREQ = 220,
    BASE_FREQ_LOW = 80;

/*

Each of these synths is actually just:

{
    'goombas': [
        {
            synth: TimbreJS object
            last_x: Last location X
            last_y: Last location Y
            last_tick: Last time this one was modified
        },
    }
}
*/

// Process the extracted objects.
function updateBoard(board){

    var length = board['objects'].length;
    var obj;

    var objects = {'goomba': [],
                   'brick': [],
                   'hole': [],
                   'mushroom': []};

    for(var i=0; i<length; i++){
        obj = board['objects'][i];

        if(obj['type'] === 'goomba' ||
           obj['type'] === 'hole' ||
           obj['type'] === 'mushroom') {
            //console.log("Goomba on the screen!");
            objects[obj['type']].push(obj);
        }
        if(obj['type'] === 'mario'){
            if (!started && obj.x === 3 && obj.y === 13) {
                started = true;
            }
            mario['x'] = obj['x'];
            mario['y'] = obj['y'];
        }
        if (obj.type === 'brick' || obj.type === 'question' || obj.type === 'pipe' || obj.type === 'chocolate_block') {
            var distance = Math.abs(mario.x - obj.x);
            if ((obj.type === 'pipe' && distance < 4) ||
                (distance === 0 || distance === 4)) {
                if (midi_started) {
                    playNoteFor(obj.type, distance, obj.y);
                }
            }
        }
    }
    updateSynths(objects);

}

/*

Create or modify the relevant synths

For each object type:
    Are the lengths of current and new objects the same?
        If so, move them to new locations;
        For each old object, find the nearest new object.
    Are there more new objects than old objects?
        For each old object, find the nearest new object, move there;
        Create a new synth for the remaining new object;
    Are there more old objects than new objects?
        For each old object, find the nearest new object.
        Delete the furthest away.

Excects an organized list of object types.

*/

function updateSynths(objects){

    var length = objects.length;
    var obj;
    var type;

    for(var key in objects){
        if (!started) {
            return;
        }
        type = key; // ex 'goomba'

        var old_synths_length;
        if(synths[type] != undefined){
            old_synths_length = synths[type].length;
        } else{
            old_synths_length = 0;
        };
        var new_synths_length = objects[type].length;

        // Move the existing synths

        if(new_synths_length == old_synths_length){

            for(var c_synth in synths[type]){
                var synth = synths[type][c_synth];

                var closest = getClosest(synth, objects[type]);
                moveSynth(synth, closest[0]);
            }
        }

        // Move the existing synths, create new synths
        else if(new_synths_length > old_synths_length){

            var unmoved_objects = objects[type];

            for(var c_synth in synths[type]){
                var synth = synths[type][c_synth];

                var closest = getClosest(synth, objects[type]);

                // moveSynth(synth, closest[0]);

                // var index = unmoved_objects.indexOf(closest[0]);
                // unmoved_objects.splice(index, 1);

            }

            for(var new_object in unmoved_objects){
                createSynth(unmoved_objects[new_object]);
            }

        }

        // Move the existing synths, delete leftovers
        else{

            var old_synths = synths[type];
            var new_objects = objects[type];

            for(var new_object in new_objects){

                var closest = getClosest(new_object, synths[type]);

                // moveSynth(closest[0], new_object);

                // var index = old_synths.indexOf(closest[0]);
                // old_synths.splice(index, 1);

            }

            for(var c_delete_me in old_synths){
                var delete_me = old_synths[c_delete_me];
                deleteSynth(delete_me, type);
            }

        }

    }

}

function getClosest(object, list){

    var dist = 9999999;
    var t_dist;
    var closest;
    for (var x in list) {

        i = list[x];

        t_dist = Math.sqrt(Math.pow(object.x - i.x, 2) + Math.pow(object.y - i.y, 2));
        if (t_dist < dist){
            closest = i;
            dist = t_dist;
        }
    }

    return [closest, dist];

}

function makeParams(new_object) {
    var type = new_object.type,
        x = new_object.x,
        y = new_object.y,
        wave,
        freq,
        mul,
        synth;
    var dist = distanceFromMario(new_object);
    if (type === 'goomba') {
        wave = 'sin';
        var freq_from_bucket = BASE_FREQ * eval(RATIOS[Math.floor(Math.max(8 - dist, 0))]);
        freq = T('+tri', {add: freq_from_bucket, freq: (10-dist), mul: 20}).kr();
        mul = 1 - (Math.abs(x - mario.x) < 2 ? 0 : (Math.abs(y - mario.y) / 10.0)) - (Math.abs(x - mario.x) / 8.0);
    } else if (type === 'mushroom') {
        wave = 'saw';
        var freq_from_bucket = (BASE_FREQ - 100) * eval(RATIOS[Math.floor(Math.max(8 - dist, 0))]);
        freq = freq_from_bucket;
        mul = 1 - (Math.abs(x - mario.x) / 16.0);
    } else if (type === 'hole') {
        wave = 'sin';
        var freq_from_bucket = BASE_FREQ_LOW * eval(RATIOS[Math.floor(Math.max(8 - dist, 0))]);
        freq = freq_from_bucket;
        mul = 1 - (Math.abs(x - mario.x) < 2 ? 0 : (Math.abs(y - mario.y) / 16.0)) - (Math.abs(x - mario.x) / 16.0);
    }

    return {wave: wave,
            freq: freq,
            mul: mul,
            synth: synth};
}

function createSynth(new_object){
    var synthHolder = {};

    var params = makeParams(new_object);
    var t = T(params.wave, {freq: params.freq, mul: params.mul},
              T("sin", {freq: params.freq * 1.01, mul: 0.05, phase: Math.PI * 0.25}),
              T("sin", {freq: params.freq * 2, mul: 0.25})).play();
    synthHolder['synth'] = t;
    synthHolder['x'] = new_object['x'];
    synthHolder['y'] = new_object['y'];

    synths[new_object['type']].push(synthHolder);
}

function deleteSynth(synthHolder, type){
    var synth = synthHolder['synth'];
    synth.pause();
    //synth.reset();

    var index = synths[type].indexOf(synthHolder);
    synths[type].splice(index, 1);
}

function moveSynth(synthHolder, new_object){
    var t = synthHolder['synth'];
    var params = makeParams(new_object);
    t.set({freq: params.freq, mul: params.mul });
}

function distanceFromMario(object){
    var dist = Math.sqrt(Math.pow(mario['x'] - object['x'], 2) + Math.pow((mario['y'] - object['y']) / 2, 2));
    return dist;

}
