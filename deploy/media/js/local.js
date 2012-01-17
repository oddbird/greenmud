/*jslint    browser:    true,
            indent:     4,
            confusion:  true */
/*global    jQuery, History */

var GM = (function (GM, $) {

    'use strict';

    var History = window.History;

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
            var controlsIndex = window.location.search.indexOf('&controls='),
                page;
            if (controlsIndex === -1) {
                page = window.location.search.substring(1);
            } else {
                page = window.location.search.substring(1, controlsIndex);
            }
            $(controls).toggleClass('active');
            $(toggle).toggleClass('active');
            if ($('#toggle').hasClass('active')) {
                History.replaceState(null, null, '?' + page + '&controls=true');
            } else {
                History.replaceState(null, null, '?' + page);
            }
        };

        $(toggle).click(function (e) {
            doToggle();
            e.preventDefault();
        });

        if (window.location.search.lastIndexOf('&controls=true') === window.location.search.length - 14) {
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
            turnToPage = function (element, stateChange) {
                var id = element.attr('id'),
                    controls = '';
                if ($('#toggle').hasClass('active')) {
                    controls = '&controls=true';
                }
                pages.removeClass('active-page prev-page next-page');
                element.addClass('active-page');
                element.next('.page').addClass('next-page');
                element.prev('.page').addClass('prev-page');
                if (stateChange) {
                    History.pushState(null, null, '?' + id + controls);
                } else {
                    History.replaceState(null, null, '?' + id + controls);
                }

                prev.add(next).removeClass('active');
                if (pages.filter('.prev-page').length) {
                    prev.addClass('active');
                }
                if (pages.filter('.next-page').length) {
                    next.addClass('active');
                }
            };

        prev.click(function (e) {
            var href = $(this).attr('href');
            if (pages.filter('.prev-page').length) {
                turnToPage(pages.filter('.prev-page'), true);
            } else if (href !== undefined) {
                if ($('#toggle').hasClass('active')) {
                    href = href + '?last&controls=true';
                } else {
                    href = href + '?last';
                }
                window.location = href;
            }
            e.preventDefault();
        });

        next.click(function (e) {
            var href = $(this).attr('href');
            if (pages.filter('.next-page').length) {
                turnToPage(pages.filter('.next-page'), true);
            } else if (href !== undefined) {
                if ($('#toggle').hasClass('active')) {
                    href = href + '?&controls=true';
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

        $(window).on('statechange', function (e) {
            var controls = window.location.search.indexOf('&controls='),
                page;
            if (controls === -1) {
                page = window.location.search.substring(1);
            } else {
                page = window.location.search.substring(1, controls);
            }
            if (page === 'last') {
                turnToPage(pages.last());
            } else if (page) {
                turnToPage(pages.filter('#' + page));
            } else {
                turnToPage(pages.first());
            }
        });

        $(window).trigger('statechange');
    };

    return GM;

}(GM || {}, jQuery));