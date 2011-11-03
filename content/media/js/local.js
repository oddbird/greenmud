/*jslint    browser:    true,
            indent:     4 */
/*global    jQuery */

var GM = (function (GM, $) {

    'use strict';

    GM.toggleControls = function (toggle, controls) {
        var doToggle = function () {
            $(controls).toggleClass('active');
            $(toggle).toggleClass('active');
            return false;
        };

        $(toggle).click(doToggle);
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

        prev.click(function () {
            if (pages.filter('.prev-page').length) {
                turnToPage(pages.filter('.prev-page'));
                return false;
            }
        });

        next.click(function () {
            if (pages.filter('.next-page').length) {
                turnToPage(pages.filter('.next-page'));
                return false;
            }
        });
    };

    return GM;

}(GM || {}, jQuery));