/*jslint    browser:    true,
            indent:     4 */
/*global    jQuery */

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
            return false;
        };

        $(toggle).click(doToggle);

        if (window.location.hash === '#controls') {
            doToggle();
        }
    };

    GM.bodyHeight = function (element) {
        var updateHeight = function (target) {
            $(target).css('height', $(window).height());
        };
        updateHeight(element);
        $(window).resize(function () {
            $.doTimeout(250, function () {
                updateHeight(element);
            });
        });
    };

    GM.pageTurning = function () {
        var prev = $('.controls .pagenav .prev a'),
            next = $('.controls .pagenav .next a'),
            pages = $('#main .page'),
            turnToPage = function (element) {
                pages.removeClass('active-page prev-page next-page');
                element.addClass('active-page');
                element.next('.page').addClass('next-page');
                element.prev('.page').addClass('prev-page');

                prev.add(next).removeClass('active');
                if (pages.filter('.prev-page').length) {
                    prev.addClass('active');
                }
                if (pages.filter('.next-page').length) {
                    next.addClass('active');
                }
            };

        turnToPage(pages.first());

        prev.click(function (e) {
            var href = $(this).attr('href');
            if (pages.filter('.prev-page').length) {
                turnToPage(pages.filter('.prev-page'));
            } else {
                if ($('#toggle').hasClass('active')) {
                    href = href + '#controls';
                }
                window.location = href;
            }
            e.preventDefault();
        });

        next.click(function (e) {
            var href = $(this).attr('href');
            if (pages.filter('.next-page').length) {
                turnToPage(pages.filter('.next-page'));
            } else {
                if ($('#toggle').hasClass('active')) {
                    href = href + '#controls';
                }
                window.location = href;
            }
            e.preventDefault();
        });

        $(document).keydown(function (e) {
            if (e.which === GM.keycodes.LEFT) {
                e.preventDefault();
                prev.first().click();
            }
            if (e.which === GM.keycodes.RIGHT) {
                e.preventDefault();
                next.first().click();
            }
        });
    };

    return GM;

}(GM || {}, jQuery));