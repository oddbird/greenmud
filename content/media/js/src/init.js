var GM = (function (GM, $) {

    'use strict';

    $(function () {
        // plugins
        $('input[placeholder], textarea[placeholder]').placeholder();

        // local.js
        GM.toggleControls('#toggle', '.controls');
        GM.bodyHeight('.page', 'min-height');

        // pageturning.js
        GM.pageTurning();
    });

    return GM;

}(GM || {}, jQuery));