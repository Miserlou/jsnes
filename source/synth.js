/*global T*/
// Dynamic objects are represented as synthesizers.
var synths = {
	'goomba': [],
	'mushroom': [],
    'brick': [],
	'turtle': []
};

var started = false;
var mario = {'x': 0, 'y': 0};

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

	//console.log("Updating board..");
	//console.log(board);

	var length = board['objects'].length;
	var obj;

	var objects = {'goomba': [],
                   'brick': []};

	for(var i=0; i<length; i++){
		obj = board['objects'][i];

		if(obj['type'] === 'goomba' ||
           obj['type'] === 'brick'){
			//console.log("Goomba on the screen!");
			objects[obj['type']].push(obj);
		}
		if(obj['type'] === 'mario'){
            if (!started && obj.x === 6 && obj.y === 7) {
                started = true;
            }
			mario['x'] = obj['x'];
			mario['y'] = obj['y'];
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

				if(closest === undefined){
					console.log("UNDEFINED CLOSEST!");
					console.log(synth);
				}

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

			console.log("new objects");
			console.log(new_objects);

			for(var new_object in new_objects){

				console.log("new object");
				console.log(new_object);

				var closest = getClosest(new_object, synths[type]);

				if(closest === undefined){
					console.log("UNDEFINED CLOSEST IN DELETER!");
					console.log(new_object);
				}

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
		console.log(i);

		t_dist = Math.abs(object.x - i.x) + Math.abs(object.y - i.y);
		if (t_dist < dist){
			closest = i;
			dist = t_dist;
		}
	}

	console.log("Closest is..");
	console.log(closest);

	return [closest, dist];

}

function makeParams(new_object) {
    var type = new_object.type,
        x = new_object.x,
        y = new_object.y,
        wave,
        freq,
        mul;
    var dist = distanceFromMario(new_object);
    if (type === 'goomba') {
        wave = 'sin';
        freq = T('pulse', {add: ((10 - dist) * 110), freq: (10-dist), mul: 20}).kr();
    } else if (type === 'brick') {
        wave = 'sin';
        freq = ((10 - dist) * 40);
        mul = 0.1;
    }

    return {wave: wave,
            freq: freq,
            mul: 1 - (Math.abs(y - mario.y) / 8.0)};
}

function createSynth(new_object){
	var synthHolder = {};

	var params = makeParams(new_object);
	var t = T(params.wave, {freq: params.freq, mul: params.mul }).play();
	synthHolder['synth'] = t;
	synthHolder['x'] = new_object['x'];
	synthHolder['y'] = new_object['y'];

	synths[new_object['type']].push(synthHolder);
}

function deleteSynth(synthHolder, type){
	// console.log("Deleting synth..")
	// console.log(synthHolder);

	var synth = synthHolder['synth'];
	synth.pause();
	//synth.reset();

	var index = synths[type].indexOf(synthHolder);
	synths[type].splice(index, 1);
}

function moveSynth(synthHolder, new_object){
	console.log("Moving synth..")
	var t = synthHolder['synth'];
    var params = makeParams(new_object);
	t.set({freq: params.freq, mul: params.mul });
}

function distanceFromMario(object){
	var dist = Math.sqrt(Math.pow(mario['x'] - object['x'], 2) + Math.pow(mario['y'] - object['y'], 2));
	return dist;

}
