/*jslint    browser:    true,
            indent:     4 */
/*global    jQuery */

var GM = (function (GM, $) {

    'use strict';

    $(function () {
        // plugins
        $('input[placeholder], textarea[placeholder]').placeholder();

        // local.js
        GM.toggleControls('#toggle', '.controls');
        GM.bodyHeight('body');
        GM.pageTurning();
    });

    return GM;

}(GM || {}, jQuery));