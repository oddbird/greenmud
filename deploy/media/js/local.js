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

    return GM;

}(GM || {}, jQuery));