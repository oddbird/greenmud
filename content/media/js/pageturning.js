/*jslint    browser:    true,
            indent:     4,
            regexp:     true */
/*global    jQuery, History */

var GM = (function (GM, $) {

    'use strict';

    // Based on https://gist.github.com/854622
    GM.pageTurning = function () {

        // Check to see if History.js is enabled for our Browser
        if (!History.enabled) {
            return false;
        }

        // Prepare Variables
        /* Application Specific Variables */
        var pageSelector = '.page',
            thisPage = $(pageSelector).addClass('active-page'),
            pageControls = $('.controls'),
            // HTML Helper
            documentHtml = function (html) {
	            // Prepare
                var result = String(html)
                    .replace(/<\!DOCTYPE[^>]*>/i, '')
                    .replace(/<(html|head|body|title|meta|script)([\s\>])/gi, '<div class="document-$1"$2')
                    .replace(/<\/(html|head|body|title|meta|script)\>/gi, '</div>');

                // Return
                return result;
            },
            turnToPage = function (page) {
                var state = {},
                    title = page.data('title'),
                    url = page.data('url'),
                    prevURL = page.data('prev'),
                    nextURL = page.data('next'),
                    pageNav = page.data('pagenav');

                if ($('#toggle').hasClass('active')) { state.controls = true; } else { state.controls = false; }

                $(pageSelector).removeClass('active-page prev-page next-page');
                page.addClass('active-page');
                page.prev(pageSelector).addClass('prev-page');
                page.next(pageSelector).addClass('next-page');

                pageControls.each(function () {
                    $(this).find('.pagenav').replaceWith(pageNav.clone());
                });

                document.title = title;
                $('title').text(title);

                History.pushState(state, title, url);
            };

        // Ajaxify
        pageControls.on('click', '.prev a', function (e) {
            // Continue as normal for cmd clicks etc
            if (e.which === 2 || e.metaKey) {
                return true;
            } else if ($(this).parent('li').hasClass('break')) {
                window.location = $(this).attr('href');
            } else {
                thisPage = $('.prev-page');
                turnToPage(thisPage);
                e.preventDefault();
            }
        });
        pageControls.on('click', '.next a', function (e) {
            // Continue as normal for cmd clicks etc
            if (e.which === 2 || e.metaKey) {
                return true;
            } else if ($(this).parent('li').hasClass('break')) {
                window.location = $(this).attr('href');
            } else {
                thisPage = $('.next-page');
                turnToPage(thisPage);
                e.preventDefault();
            }
        });

        $(document).keydown(function (e) {
            if (e.which === GM.keycodes.LEFT) {
                e.preventDefault();
                pageControls.first().find('.pagenav .prev a').click();
            }
            if (e.which === GM.keycodes.RIGHT) {
                e.preventDefault();
                pageControls.first().find('.pagenav .next a').click();
            }
        });

        // Hook into State Changes
        $(window).on('statechange', function () {
            // Prepare Variables
            var prev = pageControls.first().find('.pagenav .prev a'),
                next = pageControls.first().find('.pagenav .next a'),
                preparePrevPage = function (response, textStatus, jqXHR) {
                    // Prepare
                    var data = $(documentHtml(response)),
                        dataBody = data.find('.document-body:first'),
                        dataContent = dataBody.find(pageSelector).filter(':first'),
                        contentTitle = data.find('.document-title:first').text().replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; '),
                        dataControls = dataBody.find('.controls .pagenav').first();

                    // Store the title
                    dataContent.data('title', contentTitle);

                    // Store the prev and next page-nav
                    dataContent.data('pagenav', dataControls);

                    // Update the content and store the URL
                    dataContent.addClass('prev-page');
                    thisPage.before(dataContent);
                },
                prepareNextPage = function (response, textStatus, jqXHR) {
                    // Prepare
                    var data = $(documentHtml(response)),
                        dataBody = data.find('.document-body:first'),
                        dataContent = dataBody.find(pageSelector).filter(':first'),
                        contentTitle = data.find('.document-title:first').text().replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; '),
                        dataControls = dataBody.find('.controls .pagenav').first();

                    // Store the title
                    dataContent.data('title', contentTitle);

                    // Store the prev and next page-nav
                    dataContent.data('pagenav', dataControls);

                    // Update the content and store the URL
                    dataContent.addClass('next-page');
                    thisPage.after(dataContent);
                };

            if (!(prev.parent('li').hasClass('break')) && prev.attr('href') && !($(pageSelector).filter(function () { return $(this).data('url') === prev.attr('href'); }).length)) {
                // Ajax Request the Prev Page
                $.get(prev.attr('href'), preparePrevPage);
            }

            if (!(next.parent('li').hasClass('break')) && next.attr('href') && !($(pageSelector).filter(function () { return $(this).data('url') === next.attr('href'); }).length)) {
                // Ajax Request the Prev Page
                $.get(next.attr('href'), prepareNextPage);
            }

        }); // end onStateChange

        thisPage.data('title', $('title').text());
        thisPage.data('pagenav', $('.controls .pagenav').first());
        $(window).trigger('statechange');
    };

    return GM;

}(GM || {}, jQuery));