/*global $ ndarray PNGlib */
/*
 Object Extractor - converts a list of pixels in RGBA format into GameJSON
 params:
 - height: the height of the board
 - width: the width of the board
 - block_width: width of the game blocks in pixels
 - block_height: height of the game blocks in pixels
 - top_offset: how far from the top the extractor should start reading
 - objects: map of object name to known RGB values

 returns:
 - GameJSON: map of row number to a list of the game objects in the row

 Sample GameJSON object
 var gameJSON = {
     width: 128,
     height: 128,
     objects: [{
         type: 'goomba',
         x: 5,
         y: 10,
     }, {
         type: 'pipe',
         x: 10,
         y: 4,
     }]
 }

*/
(function($, window){
    var ObjectExtractor = function(config){
        var self = this,
            height = config.height,
            width = config.width,
            block_width = config.block_width,
            block_height = config.block_height,
            top_offset = config.top_offset,
            blocks_per_row = Math.floor(width / block_width),
            blocks_per_column = Math.floor((height - top_offset) / block_height);

        var sprites = {'mario': [[[188, 25, 0], 0, 0], [[188, 25, 0], 1, 0], [[188, 25, 0], 2, 0], [[188, 25, 0], 3, 0], [[188, 25, 0], 4, 0], [[188, 25, 0], 0, 1], [[188, 25, 0], 1, 1], [[188, 25, 0], 2, 1], [[188, 25, 0], 3, 1], [[188, 25, 0], 4, 1]],
                       'goomba': [[[177, 84, 0], 0, 0], [[177, 84, 0], 1, 0], [[177, 84, 0], 2, 0], [[177, 84, 0], 3, 0], [[177, 84, 0], 4, 0], [[177, 84, 0], 5, 0], [[177, 84, 0], 6, 0], [[177, 84, 0], 7, 0], [[177, 84, 0], 8, 0], [[177, 84, 0], 9, 0], [[177, 84, 0], 10, 0], [[177, 84, 0], 11, 0], [[177, 84, 0], 12, 0], [[177, 84, 0], 13, 0], [[177, 84, 0], 14, 0], [[177, 84, 0], 15, 0], [[255, 209, 199], 5, 1], [[255, 209, 199], 6, 1], [[255, 209, 199], 7, 1], [[255, 209, 199], 8, 1], [[255, 209, 199], 9, 1], [[255, 209, 199], 10, 1]]

                                 };

        function translateTo(position, x, y) {
            return position + 4 * ((y * width) + x)
        }

        function getBlockFromPosition(position) {
            var pixel_pos = position / 4,
                pixel_y = Math.floor(pixel_pos / width),
                pixel_x = pixel_pos % width,
                block_y = Math.floor(pixel_y / blocks_per_column),
                block_x = Math.floor(pixel_x / blocks_per_row);
            return [block_x, block_y];
        }

        function isPixelMatch(r1, g1, b1, r2, g2, b2) {
            return (Math.abs(r2-r1) < 1 &&
                    Math.abs(g2-g1) < 1 &&
                    Math.abs(b2-b1) < 1)
        }

        $.extend(self, {
            getObjects: function(data, include_object_data) {
                // data is list of RGBA elements
                var blocks = [],
                    objects = [],
                    object_data = [];
                for (var i=0, n = data.length; i<n; i += 4) {
                    var r = data[i],
                        g = data[i+1],
                        b = data[i+2];
                    for (var key in sprites) {
                        if (sprites.hasOwnProperty(key)) {
                            var object = sprites[key],
                                object_first_pixel = object[0][0],
                                object_r = object_first_pixel[0],
                                object_g = object_first_pixel[1],
                                object_b = object_first_pixel[2];
                            if (isPixelMatch(r, g, b, object_r, object_g, object_b)) {
                                var found = true;
                                for (var sprite_ctr = 1; sprite_ctr < object.length; sprite_ctr++) {
                                    var next_entry = object[sprite_ctr],
                                        next_entry_pixel = next_entry[0],
                                        x = next_entry[1],
                                        y = next_entry[2],
                                        new_pixel_pos = translateTo(i, x, y),
                                        new_r = data[new_pixel_pos],
                                        new_g = data[new_pixel_pos+1],
                                        new_b = data[new_pixel_pos+2];
                                    if (!isPixelMatch(next_entry_pixel[0], next_entry_pixel[1], next_entry_pixel[2], new_r, new_g, new_b)) {
                                        found = false;
                                        break;
                                    }
                                }
                                if (found) {
                                    var blockPosition = getBlockFromPosition(i);

                                    // if (include_object_data) {
                                    // $.each(tmp_viewer_data, function(i) {
                                    // object_data[parseInt(i, 10)] = parseInt(this, 10);
                                    // });
                                    // }
                                    var exists = false;
                                    for (var obj_key in objects) {
                                        if (objects.hasOwnProperty(obj_key)) {
                                            var obj_value = objects[obj_key];
                                            if ((key === 'mario' && obj_value.type === 'mario') ||
                                                (obj_value.type === key &&
                                                 obj_value.x === blockPosition[0] &&
                                                 obj_value.y === blockPosition[1])) {
                                                exists = true;
                                            }


                                        }
                                    }
                                    if (!exists) {
                                        objects.push({type: key,
                                                      x: blockPosition[0],
                                                      y: blockPosition[1]})
                                    }
                                }
                            }
                        }
                    }
                }
                var return_data = {width: width,
                                   height: height,
                                   objects: objects};
                if (include_object_data) {
                    return_data['object_data'] = object_data;
                }
                return return_data;

            }
        });
    };

    var settings = {
        block_width: 16,
        block_height: 16,
        height: null,
        width: null,
        top_offset: 8
    };

    $.objectExtractor = function(config){
        var cfg = $.extend({}, settings, config);
        return new ObjectExtractor(cfg);
    };
})(jQuery, window);
