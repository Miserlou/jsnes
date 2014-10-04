/*global JSNES updateBoard*/
var nes;
$(function() {
    nes = new JSNES({
        'ui': $('#emulator').JSNESUI({
            'Homebrew': [
                ['Concentration Room', 'roms/croom/croom.nes'],
                ['LJ65', 'roms/lj65/lj65.nes']
            ],
            'Working': [
                ['Bubble Bobble', 'local-roms/Bubble Bobble (U).nes'],

                ['Contra', 'local-roms/Contra (U) [!].nes'],
                ['Donkey Kong', 'local-roms/Donkey Kong (JU).nes'],
                ['Dr. Mario', 'local-roms/Dr. Mario (JU).nes'],
                ['Golf', 'local-roms/Golf (JU).nes'],
                ['The Legend of Zelda', 'local-roms/Legend of Zelda, The (U) (PRG1).nes'],
                ['Lemmings', 'local-roms/Lemmings (U).nes'],
                ['Lifeforce', 'local-roms/Lifeforce (U).nes'],

                ['Mario Bros.', 'local-roms/Mario Bros. (JU) [!].nes'],
                ['Mega Man', 'local-roms/Mega Man (U).nes'],
                ['Pac-Man', 'local-roms/Pac-Man (U) [!].nes'],
                ['Super Mario Bros.', 'local-roms/Super Mario Bros. (JU) (PRG0) [!].nes'],
                ['Tennis', 'local-roms/Tennis (JU) [!].nes'],
                ['Tetris', 'local-roms/Tetris (U) [!].nes'],
                ['Tetris 2', 'local-roms/Tetris 2 (U) [!].nes'],
                ['Zelda II - The Adventure of Link', 'local-roms/Zelda II - The Adventure of Link (U).nes']
            ],

            'Nearly Working': [
                ['Duck Hunt', 'local-roms/Duck Hunt (JUE) [!].nes'],
                ['Super Mario Bros. 3', 'local-roms/Super Mario Bros. 3 (U) (PRG1) [!].nes']
            ]
        })
    });
    var objects = {'bricks': [ 136.0625, 57.46875, 18.21875 ],
                   'chocolate_block': [ 142.875, 86, 63.875 ],
                   'goomba': [ 141.75, 113.875, 132.4375 ],
                   'mushroom': [ 195.25, 142.640625, 132.015625 ],
                   'oneup': [ 154.75, 166.640625, 132.015625 ],
                   'peace_flag': [ 122.796875, 181.046875, 202.859375 ],
                   'question': [ 187.203125, 103.875, 36.3125 ],
                   'star': [ 167.40625, 147.28125, 157.28125 ],
                   'star_flag': [ 159.09375, 164.609375, 214.703125 ],
                   'turtle': [ 104.703125, 162.921875, 154.984375 ] };
    var canvas = $('.nes-screen')[0],
        canvas_ctx = canvas.getContext('2d'),
        objectExtractor = $.objectExtractor({width: canvas.width,
                                             height: canvas.height,
                                             objects: objects});
    setInterval(function() {
        var imageData = canvas_ctx.getImageData(0, 0, canvas.width, canvas.height),
            data = imageData.data;
        var board = objectExtractor.getObjects(data);
        console.log(board);
        // updateBoard(board);
        $('#objects').text(JSON.stringify(board.objects));
    }, 300);
});
