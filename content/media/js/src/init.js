var GM = (function (GM, $) {

    'use strict';

    $(function () {
        // plugins
        // $('input[placeholder], textarea[placeholder]').placeholder();

        // local.js
        GM.toggleControls('#toggle', '.controls', 'div[data-role="page"]');
        GM.bodyHeight('.page', 'min-height');
        // GM.pageTurning();
    });

    return GM;

}(GM || {}, jQuery));