var GM = (function (GM, $) {

    'use strict';

    // Store keycode variables for easier readability
    GM.keycodes = {
        SPACE: 32,
        ENTER: 13,
        TAB: 9,
        ESC: 27,
        BACKSPACE: 8,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        CAPS: 20,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    GM.toggleControls = function (tog, cont) {
        var toggle = $(tog);
        var controls = $(cont);

        var doToggle = function () {
            controls.toggleClass('active');
            toggle.toggleClass('active');
        };

        toggle.click(function () {
            $(this).blur();
            doToggle();
            return false;
        });

        controls.on('click', 'nav a', function () {
            doToggle();
        });

        controls.on('click', '.pagenav a', function () {
            if (controls.hasClass('active')) {
                doToggle();
            }
        });
    };

    GM.instructions = function () {
        var instructions = $('.instructions');
        var toggle = $('#toggle');
        var controls = $('.controls');
        var showInstructions = function () {
            instructions.fadeIn('fast');
            attachHandlers();
        };
        var hideInstructions = function () {
            instructions.fadeOut('fast');
            detachHandlers();
            if (Modernizr.localstorage) {
                localStorage.setItem('instructions', 'false');
            }
        };
        var attachHandlers = function () {
            toggle.one('click.instructions', function () {
                if (instructions.is(':visible')) {
                    hideInstructions();
                }
            });
            controls.one('click.instructions', '.pagenav a', function () {
                if (instructions.is(':visible')) {
                    hideInstructions();
                    $('body').removeClass('swiping-next swiping-prev');
                    return false;
                }
            });
        };
        var detachHandlers = function () {
            toggle.off('click.instructions');
            controls.off('click.instructions', '.pagenav a');
        };

        if (Modernizr.localstorage && localStorage.getItem('instructions') !== 'false') {
            showInstructions();
        }

        controls.on('click', 'a[href="#instructions"]', function () {
            showInstructions();
            return false;
        });
    };

    return GM;

}(GM || {}, jQuery));