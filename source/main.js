/*global JSNES*/
var nes;
$(function() {
    nes = new JSNES({
        'ui': $('#emulator').JSNESUI({
            "Homebrew": [
                ['Concentration Room', 'roms/croom/croom.nes'],
                ['LJ65', 'roms/lj65/lj65.nes']
            ],
            "Working": [
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

            "Nearly Working": [
                ['Duck Hunt', 'local-roms/Duck Hunt (JUE) [!].nes'],
                ['Super Mario Bros. 3', 'local-roms/Super Mario Bros. 3 (U) (PRG1) [!].nes']
            ]
        })
    });
});
