
// Dynamic objects are represented as synthesizers. 
var synths = {
	'goomba': [],
	'mushroom': [],
	'turtle': []
};

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

	var objects = {'goomba': []};

	for(var i=0; i<length; i++){
		obj = board['objects'][i];

		if(obj['type'] === 'goomba'){
			//console.log("Goomba on the screen!");
			objects['goomba'].push(obj);
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
			for(var synth in synths[type]){
				var closest = getClosest(synth, objects[type]);
				moveSynth(synth, closest[0]);
			}
		}

		// Move the existing synths, create new synths
		else if(new_synths_length > old_synths_length){

			var unmoved_objects = objects[type];

			for(var synth in synths[type]){

				var closest = getClosest(synth, objects[type]);
				moveSynth(synth, closest[0]);

				var index = unmoved_objects.indexOf(closest[0]);
				unmoved_objects.splice(index, 1);

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
				moveSynth(closest[0], new_object);

				var index = old_synths.indexOf(closest[0]);
				old_synths.splice(index, 1);

			}

			for(var delete_me in old_synths){
				deleteSynth(old_synths[delete_me], type);
			}

		}

	}

}

function getClosest(object, list){

	var dist = 9999999;
	var t_dist;
	var closest;
	for (var i in list) {

		t_dist = Math.abs(object.x - i.x) + Math.abs(object.y - i.y);
		if (t_dist < dist){
			closest = i;
			dist = t_dist;
		} 
	}

	return [closest, dist];

}

function createSynth(new_object){

	var synthHolder = {};
	var t = T("sin", {freq:200}).play();
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
	// console.log("Moving synth..")
	// var synth = synthHolder['synth'];
	//synth.set();
}
