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

    GM.toggleControls = function (toggle, controls, hash) {
        var doToggle = function () {
            $(controls).toggleClass('active');
            $(toggle).toggleClass('active');
        };

        $(toggle).click(function (e) {
            doToggle();
            e.preventDefault();
        });

        if (window.location.hash === '#' + hash) {
            doToggle();
        }
    };

    GM.bodyHeight = function (element, property) {
        var updateHeight = function (target) {
            $(target).css(property, $(window).height());
        };
        updateHeight(element);
        $(window).resize(function () {
            $.doTimeout('resize', 250, function () {
                updateHeight(element);
            });
        });
    };

    return GM;

}(GM || {}, jQuery));