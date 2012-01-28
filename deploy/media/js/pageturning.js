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
            thisPage = $(pageSelector),
            pageControls = $('.controls'),
            stateChange = false,
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
            turnToPage = function (page, replaceState) {
                var state = {},
                    title = page.data('title'),
                    url = page.data('url'),
                    id = page.attr('id');

                if ($('#toggle').hasClass('active')) { state.controls = true; } else { state.controls = false; }
                state.title = title;
                state.url = url;
                state.id = id;

                if (replaceState) {
                    History.replaceState(state, title, url);
                    if (!stateChange) {
                        $(window).trigger('statechange');
                    }
                } else {
                    History.pushState(state, title, url);
                }
            };

        // Ajaxify
        pageControls.on('click', '.prev a', function (e) {
            stateChange = false;
            // Continue as normal for cmd clicks etc
            if (e.which === 2 || e.metaKey) {
                return true;
            } else if ($(this).parent('li').hasClass('break')) {
                if ($('#toggle').hasClass('active')) {
                    window.location = $(this).attr('href') + '#controls';
                } else {
                    window.location = $(this).attr('href');
                }
                e.preventDefault();
            } else {
                if ($('.prev-page').length) {
                    turnToPage($('.prev-page'));
                }
                e.preventDefault();
            }
        });
        pageControls.on('click', '.next a', function (e) {
            stateChange = false;
            // Continue as normal for cmd clicks etc
            if (e.which === 2 || e.metaKey) {
                return true;
            } else if ($(this).parent('li').hasClass('break')) {
                if ($('#toggle').hasClass('active')) {
                    window.location = $(this).attr('href') + '#controls';
                } else {
                    window.location = $(this).attr('href');
                }
                e.preventDefault();
            } else {
                if ($('.next-page').length) {
                    turnToPage($('.next-page'));
                }
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
            var state = History.getState().data,
                title = state.title,
                pageNav,
                prev,
                next,
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

                    // Set min-height of new page to be window height
                    dataContent.css('min-height', $(window).height());

                    // Update the content and store the URL
                    dataContent.addClass('prev-page');
                    $('.active-page').before(dataContent);
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

                    // Set min-height of new page to be window height
                    dataContent.css('min-height', $(window).height());

                    // Update the content and store the URL
                    dataContent.addClass('next-page');
                    $('.active-page').after(dataContent);
                };

            stateChange = true;
            thisPage = $('#' + state.id);
            pageNav = thisPage.data('pagenav');
            $(pageSelector).removeClass('active-page prev-page next-page');
            thisPage.addClass('active-page');
            thisPage.prev(pageSelector).addClass('prev-page');
            thisPage.next(pageSelector).addClass('next-page');
            $('.main').css('height', thisPage.height());

            pageControls.each(function () {
                $(this).find('.pagenav').replaceWith(pageNav.clone());
            });

            document.title = title;
            $('title').text(title);

            prev = pageControls.first().find('.pagenav .prev a');
            next = pageControls.first().find('.pagenav .next a');

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
        turnToPage(thisPage, true);
    };

    return GM;

}(GM || {}, jQuery));