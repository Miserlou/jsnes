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
            blocks_per_column = Math.floor((height - top_offset) / block_height),
            viewer_canvas = document.getElementById('viewer');
        // blocks_per_row = 2;
        // blocks_per_column = 1;

        $.extend(self, {
            getObjects: function(data) {
                // data is list of RGBA elements
                var blocks = [],
                    objects = [];
                var viewer_canvas_ctx = viewer_canvas.getContext('2d'),
                    viewer_canvas_data = viewer_canvas_ctx.createImageData(width, height),
                    viewer_data = viewer_canvas_data.data;
                for (var block_number_x = 0; block_number_x < blocks_per_row; block_number_x++) {
                    for (var block_number_y = 0; block_number_y < blocks_per_column; block_number_y++) {
                        var r_total = 0,
                            g_total = 0,
                            b_total = 0,
                            total = 0;
                        var tmp_viewer_data = {};
                        for (var y = 0; y < block_width; y++) {
                            for (var x = 0; x < block_width; x++) {
                                total = total + 1;
                                var ctx_offset = ((block_number_y * blocks_per_row + y) * block_width * block_height * 4) + ((block_number_x * block_width + x) * 4);
                                var r = data[ctx_offset],
                                    g = data[ctx_offset+1],
                                    b = data[ctx_offset+2];
                                tmp_viewer_data[ctx_offset] = r;
                                tmp_viewer_data[ctx_offset + 1] = g;
                                tmp_viewer_data[ctx_offset + 2] = b;
                                tmp_viewer_data[ctx_offset + 3] = 0xFF;
                                // viewer_data[ctx_offset] = r;
                                // viewer_data[ctx_offset + 1] = g;
                                // viewer_data[ctx_offset + 2] = b;
                                // viewer_data[ctx_offset + 3] = 0xFF;
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
                        if (found_type) {
                            $.each(tmp_viewer_data, function(i) {
                                viewer_data[parseInt(i, 10)] = parseInt(this, 10);
                            });
                            objects.push({type: found_type,
                                            x: block_number_x,
                                            y: blocks_per_column - block_number_y})
                        }

                        blocks.push([r_total, g_total, b_total]);
                    }
                }
                viewer_canvas_ctx.putImageData(viewer_canvas_data, 0, 0);
                return {width: width,
                        height: height,
                        objects: objects,
                        data: viewer_canvas_data};
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
