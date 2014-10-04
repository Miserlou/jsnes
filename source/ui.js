/*global Gamepad JSNES DynamicAudio*/
/*
 JSNES, based on Jamie Sanders' vNES
 Copyright (C) 2010 Ben Firshman

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

JSNES.DummyUI = function(nes) {
    this.nes = nes;
    this.enable = function() {};
    this.updateStatus = function() {};
    this.writeAudio = function() {};
    this.writeFrame = function() {};
};

if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.JSNESUI = function(roms) {
            var parent = this;
            var UI = function(nes) {
                var self = this;
                self.nes = nes;

                /*
                 * Create UI
                 */
                self.root = $('<div></div>');
                self.screen = $('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(self.root);

                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.root);
                self.romSelect = $('<select></select>').appendTo(self.romContainer);

                self.controls = $('<div class="nes-controls"></div>').appendTo(self.root);
                self.buttons = {
                    pause: $('<input type="button" value="pause" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                    restart: $('<input type="button" value="restart" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    sound: $('<input type="button" value="enable sound" class="nes-enablesound">').appendTo(self.controls),
                    zoom: $('<input type="button" value="zoom in" class="nes-zoom">').appendTo(self.controls)
                };
                self.status = $('<p class="nes-status">Booting up...</p>').appendTo(self.root);
                self.root.appendTo(parent);

                /*
                 * ROM loading
                 */
                self.romSelect.change(function() {
                    self.loadROM();
                });

                /*
                 * Buttons
                 */
                self.buttons.pause.click(function() {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("Paused");
                        self.buttons.pause.attr("value", "resume");
                    }
                    else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "pause");
                    }
                });

                self.buttons.restart.click(function() {
                    self.nes.reloadRom();
                    self.nes.start();
                });

                self.buttons.sound.click(function() {
                    if (self.nes.opts.emulateSound) {
                        self.nes.opts.emulateSound = false;
                        self.buttons.sound.attr("value", "enable sound");
                    }
                    else {
                        self.nes.opts.emulateSound = true;
                        self.buttons.sound.attr("value", "disable sound");
                    }
                });

                self.zoomed = false;
                self.buttons.zoom.click(function() {
                    if (self.zoomed) {
                        self.screen.animate({
                            width: '256px',
                            height: '240px'
                        });
                        self.buttons.zoom.attr("value", "zoom in");
                        self.zoomed = false;
                    }
                    else {
                        self.screen.animate({
                            width: '512px',
                            height: '480px'
                        });
                        self.buttons.zoom.attr("value", "zoom out");
                        self.zoomed = true;
                    }
                });

                /*
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
                if ($.offset) {
                    self.screen.mousedown(function(e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function() {
                        setTimeout(function() {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }

                if (typeof roms != 'undefined') {
                    self.setRoms(roms);
                }

                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');

                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();

                /*
                 * Keyboard
                 */
                $(document).
                    bind('keydown', function(evt) {
                        self.nes.keyboard.keyDown(evt);
                    }).
                    bind('keyup', function(evt) {
                        self.nes.keyboard.keyUp(evt);
                    }).
                    bind('keypress', function(evt) {
                        self.nes.keyboard.keyPress(evt);
                    });

                /*
                 * Hack in the Gamepad
                 */

                $(document).ready(function() {

                    // Attach it to the window so it can be inspected at the console.
                    var gamepad = new Gamepad();

                    console.log(gamepad);

                    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
                        // a new gamepad connected

                        console.log("connected!");
                        console.log(device);
                    });

                    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
                        // gamepad disconnected
                        console.log("disconnected!");
                    });

                    gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
                        // an unsupported gamepad connected (add new mapping)
                        console.log("unsupported!");
                    });

                    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
                        // e.control of gamepad e.gamepad pressed down
                        console.log("down!");
                        console.log(e.control);
                        switch(e.control) {
                        case "FACE_2":
                        case "FACE_3":
                            self.nes.keyboard.setKey(88, 0x41);
                            break;
                        case "FACE_1":
                            self.nes.keyboard.setKey(90, 0x41);
                            break;
                        case "SELECT_BACK":
                            self.nes.keyboard.setKey(88, 0x41);
                            break;
                        case "LEFT_BOTTOM_SHOULDER":
                            self.nes.keyboard.setKey(90, 0x41);
                            break;
                        case "START_FORWARD":
                            self.nes.keyboard.setKey(13, 0x41);
                            break;
                        }
                    });

                    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
                        // e.control of gamepad e.gamepad released
                        console.log("up!");
                        console.log(e.control);
                        switch(e.control){
                        case "FACE_2":
                        case "FACE_3":
                            self.nes.keyboard.setKey(88, 0x40);
                            break;
                        case "FACE_1":
                            self.nes.keyboard.setKey(90, 0x40);
                            break;
                        case "SELECT_BACK":
                            self.nes.keyboard.setKey(88, 0x40);
                            break;
                        case "LEFT_BOTTOM_SHOULDER":
                            self.nes.keyboard.setKey(90, 0x40);
                            break;
                        case "START_FORWARD":
                            self.nes.keyboard.setKey(13, 0x40);
                            break;
                        }
                    });

                    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
                        // e.axis changed to value e.value for gamepad e.gamepad
                        console.log("axis changed!");
                        switch(e.axis){
                        case "LEFT_STICK_X":
                            switch(e.value){
                            case -1:
                                //Left
                                self.nes.keyboard.setKey(37, 0x41);
                                break;
                            case 0:
                                // Zero
                                self.nes.keyboard.setKey(37, 0x40);
                                self.nes.keyboard.setKey(39, 0x40);
                                break;
                            case 1:
                                // Right
                                self.nes.keyboard.setKey(39, 0x41);
                                break;
                            }
                            break;
                        case "LEFT_STICK_Y":
                            switch(e.value){
                            case -1:
                                // Up
                                self.nes.keyboard.setKey(38, 0x41);
                                break;
                            case 0:
                                // Zero
                                self.nes.keyboard.setKey(38, 0x40);
                                self.nes.keyboard.setKey(40, 0x40);
                                break;
                            case 1:
                                // Down
                                self.nes.keyboard.setKey(40, 0x41);
                                break;
                            }
                            break;
                        }

                        console.log(e.axis);
                        console.log(e.value);
                    });

                    gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
                        // gamepads were updated (around 60 times a second)
                    });


                    if (!gamepad.init()) {
                        alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
                    }

                });

                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath+'dynamicaudio.swf'
                });

                /*
                 * Load Mario ROM and begin game
                 */
                $(document).ready(function() {
                    self.romSelect.val('local-roms/Super Mario Bros. (JU) (PRG0) [!].nes');
                    self.loadROM();
                });

            };

            UI.prototype = {
                loadROM: function() {
                    var self = this;
                    self.updateStatus("Downloading...");
                    $.ajax({
                        url: escape(self.romSelect.val()),
                        xhr: function() {
                            var xhr = $.ajaxSettings.xhr();
                            if (typeof xhr.overrideMimeType !== 'undefined') {
                                // Download as binary
                                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                            }
                            self.xhr = xhr;
                            return xhr;
                        },
                        complete: function(xhr, status) {
                            var i, data;
                            if (JSNES.Utils.isIE()) {
                                var charCodes = JSNESBinaryToArray(
                                    xhr.responseBody
                                ).toArray();
                                data = String.fromCharCode.apply(
                                    undefined,
                                    charCodes
                                );
                            }
                            else {
                                data = xhr.responseText;
                            }
                            self.nes.loadRom(data);
                            self.nes.start();
                            self.enable();
                        }
                    });
                },

                resetCanvas: function() {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },

                /*
                 *
                 * nes.ui.screenshot() --> return <img> element :)
                 */
                screenshot: function() {
                    var data = this.screen[0].toDataURL("image/png"),
                        img = new Image();
                    img.src = data;
                    return img;
                },

                /*
                 * Enable and reset UI elements
                 */
                enable: function() {
                    this.buttons.pause.attr("disabled", null);
                    if (this.nes.isRunning) {
                        this.buttons.pause.attr("value", "pause");
                    }
                    else {
                        this.buttons.pause.attr("value", "resume");
                    }
                    this.buttons.restart.attr("disabled", null);
                    if (this.nes.opts.emulateSound) {
                        this.buttons.sound.attr("value", "disable sound");
                    }
                    else {
                        this.buttons.sound.attr("value", "enable sound");
                    }
                },

                updateStatus: function(s) {
                    this.status.text(s);
                },

                setRoms: function(roms) {
                    this.romSelect.children().remove();
                    $("<option>Select a ROM...</option>").appendTo(this.romSelect);
                    for (var groupName in roms) {
                        if (roms.hasOwnProperty(groupName)) {
                            var optgroup = $('<optgroup></optgroup>').
                                    attr("label", groupName);
                            for (var i = 0; i < roms[groupName].length; i++) {
                                $('<option>'+roms[groupName][i][0]+'</option>')
                                    .attr("value", roms[groupName][i][1])
                                    .appendTo(optgroup);
                            }
                            this.romSelect.append(optgroup);
                        }
                    }
                },

                writeAudio: function(samples) {
                    return this.dynamicaudio.writeInt(samples);
                },

                writeFrame: function(buffer, prevBuffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;

                    for (i=0; i<256*240; i++) {
                        pixel = buffer[i];

                        if (pixel != prevBuffer[i]) {
                            j = i*4;
                            imageData[j] = pixel & 0xFF;
                            imageData[j+1] = (pixel >> 8) & 0xFF;
                            imageData[j+2] = (pixel >> 16) & 0xFF;
                            prevBuffer[i] = pixel;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };

            return UI;
        };
    })(jQuery);
}
