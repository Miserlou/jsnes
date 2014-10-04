/* global $*/
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

 var board = [
     [{
         "type": "question",
         "height": 5
     }],
     [],
     [],
     [],
     [{
         "type": "bricks",
         "height": 5
     }],
     [{
         "type": "mushroom",
         "height": 6
     }, {
         "type": "question",
         "height": 5
     }]
 ];

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

        $.extend(self, {
            getObjects: function(pixels) {
                // pixels in RGBA format
                var blocks = [],
                    notes = [];

                for (var block_number_y = 0; block_number_y < blocks_per_column; block_number_y++) {
                    for (var block_number_x = 0; block_number_x < blocks_per_row; block_number_x++) {
                        var r_total = 0,
                            g_total = 0,
                            b_total = 0,
                            total = 0;
                            // png = new PNG({width: block_width,
                                           // height: block_width});
                        for (var x = 0; x < block_width; x++) {
                            for (var y = 0; y < block_width; y++) {
                                var top = top_offset + block_number_y * block_height + y,
                                    left = block_number_x * block_width + x;
                                total = total + 1;
                                var r = pixels.get(top,left,0),
                                    g = pixels.get(top,left,1),
                                    b = pixels.get(top,left,2);
                                var offset = (x + y * block_width) * 4;
                                // png.data[offset] = r;
                                // png.data[offset + 1] = g;
                                // png.data[offset + 2] = b;
                                // png.data[offset + 3] = 0xFF;
                                r_total += r;
                                g_total += g;
                                b_total += b;
                            }
                        }
                        r_total /= total;
                        g_total /= total;
                        b_total /= total;
                        var found_type = '';
                        $.each(config.objects, function(key) {
                            var r = this[0],
                                g = this[1],
                                b = this[2];
                            if (Math.abs(r - r_total) + Math.abs(g - g_total) + (Math.abs(b - b_total) / 10) < 15) {
                                found_type = key;
                            }
                        });
                        var note_list = notes[block_number_x];
                        if (!note_list) {
                            notes[block_number_x] = [];
                            note_list = notes[block_number_x];
                        }
                        if (found_type) {
                            note_list.push({type: found_type, height: blocks_per_column - block_number_y});
                        }

                        blocks.push([r_total, g_total, b_total]);
                    }
                }
                return notes;
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