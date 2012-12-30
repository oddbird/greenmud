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

    GM.toggleControls = function (toggle, controls) {
        var doToggle = function () {
            $(controls).toggleClass('active');
            $(toggle).toggleClass('active');
        };

        $(toggle).click(function () {
            $(this).blur();
            doToggle();
            if (Modernizr.sessionstorage) {
                sessionStorage.setItem('controls', $(controls).hasClass('active'));
            }
            return false;
        });

        if (Modernizr.sessionstorage && sessionStorage.getItem('controls') === 'true') {
            $(controls).addClass('active');
            $(toggle).addClass('active');
        }
    };

    GM.toc = function (toggle, controls) {
        $(toggle).click(function () {
            $(this).blur();
            $(controls).toggleClass('active');
            $(toggle).toggleClass('active');
            return false;
        });
    };

    return GM;

}(GM || {}, jQuery));