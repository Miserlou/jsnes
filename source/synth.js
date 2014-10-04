
// Dynamic objects are represented as synthesizers. 
var synths = [];

/*

Each of these synths is actually just:

{

	'goombas': {

		synth: TimbreJS object
		last_x: Last location X
		last_y: Last location Y
		last_tick: Last time this one was modified

	}
	
}
*/


// Process the extracted objects.
function updateBoard(board){

	var length = board.length;
	var obj;

	var objects = {'goombas': []};

	for(var i=0; i<length; i++){
		obj = board[i];

		if(obj['type'] == 'goomba'){
			objects['goombas'].push(obj);
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
		type = objects[key]; // ex 'goomba'

		// Move the existing synths
		if(type.length == synths[type].length){
			for(var synth in synths[type]){

				console.log("Moving synth to");
				var closest = getClosest(synth, objects[type]);
				console.log(closest[0].x + ", " + closest[0].y);
			}
		}

		// Move the existing synths, create new synths
		else if(type.length > synths[type].length){

			var unmoved_objects = objects[type];
			for(var synth in synths[type]){

				console.log("Moving synth to");
				var closest = getClosest(synth, objects[type]);
				console.log(closest[0].x + ", " + closest[0].y);
				unmoved_synths.remove(closest[0]);

			}

			for(var new_synth in unmoved_objects){
				console.log("Creating new synth for ");
				console.log(new_synth);
			}

		}

		// Move the existing synths, delete leftovers
		else{

			var old_synths = synths[type];
			var new_objects = objects[type];


			for(var new_object in new_objects){
				var closest = getClosest(new_object, synths[type]);
				console.log("Moving synth");
				old_synths.remove(closest[0]);

			}

			for(var delete_me in old_synths){
				console.log("Deleting synth");
				console.log(delete_me);
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