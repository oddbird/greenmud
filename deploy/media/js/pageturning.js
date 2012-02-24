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
            pageturn,
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

        // Hijack all internal links
        $('body').on('click', 'a', function (e) {
            var thisLink = $(this),
                href = $(this).attr('href'),
                page,
                fallback = function (link) {
                    if ($('#toggle').hasClass('active')) {
                        window.location = link.attr('href') + '#controls';
                    } else {
                        window.location = link.attr('href');
                    }
                };
            stateChange = false;
            // Prev/Next page-turns use classes for css-animation
            if (thisLink.parent().hasClass('prev')) {
                pageturn = 'prev';
            } else if (thisLink.parent().hasClass('next')) {
                pageturn = 'next';
            }
            // Continue as normal for cmd clicks etc
            if (e.which === 2 || e.metaKey || (href && href.indexOf('http://') === 0)) {
                return true;
            } else if (href) {
                e.preventDefault();
                if ($(this).hasClass('break')) {
                    fallback(thisLink);
                } else {
                    if ($(this).data('id') && $('.main').data($(this).data('id'))) {
                        page = $('.main').data($(this).data('id'));
                        turnToPage(page);
                    } else {
                        fallback(thisLink);
                    }
                }
            } else {
                e.preventDefault();
            }
        });

        // LEFT or RIGHT triggers page-turn click
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
                pageturnExitClass,
                pageturnEnterClass,
                preparePage = function (response) {
                    // Prepare
                    var data = $(documentHtml(response)),
                        dataBody = data.find('.document-body:first'),
                        dataContent = dataBody.find(pageSelector).filter(':first'),
                        contentTitle = data.find('.document-title:first').text().replace('<', '&lt;').replace('>', '&gt;').replace(' & ', ' &amp; '),
                        dataControls = dataBody.find('.controls .pagenav').first(),
                        id = dataContent.attr('id');

                    // Store the title
                    dataContent.data('title', contentTitle);

                    // Store the prev and next page-nav
                    dataContent.data('pagenav', dataControls);

                    // Set min-height of new page to be window height
                    dataContent.css('min-height', $(window).height());

                    // Store the content as a data-attr on .main
                    $('.main').data(id, dataContent);
                },
                ajaxFetchPages = function () {
                    prev = pageControls.first().find('.pagenav .prev a');
                    next = pageControls.first().find('.pagenav .next a');

                    if (!(prev.hasClass('break')) && prev.attr('href') && !($('.main').data(prev.data('id')))) {
                        // Ajax Request the Prev Page
                        $.get(prev.attr('href'), preparePage);
                    }

                    if (!(next.hasClass('break')) && next.attr('href') && !($('.main').data(next.data('id')))) {
                        // Ajax Request the Next Page
                        $.get(next.attr('href'), preparePage);
                    }
                },
                replacePage = function () {
                    $('body').attr('class', thisPage.data('body-class'));
                    document.title = title;
                    $('title').text(title);
                    $.scrollTo(0);

                    pageControls.each(function () {
                        $(this).find('.pagenav').replaceWith(pageNav.clone());
                    });

                    ajaxFetchPages();
                };

            if ($(pageSelector).attr('id') !== state.id) {
                thisPage = $('.main').data(state.id);
                pageNav = thisPage.data('pagenav');
                if (pageturn === 'prev' || pageturn === 'next') {
                    if (pageturn === 'prev') {
                        pageturnExitClass = 'exit-next';
                        pageturnEnterClass = 'enter-prev';
                    } else if (pageturn === 'next') {
                        pageturnExitClass = 'exit-prev';
                        pageturnEnterClass = 'enter-next';
                    }
                    $(pageSelector).removeClass('enter-prev enter-next').addClass(pageturnExitClass);
                    $.doTimeout(300, function () {
                        replacePage();
                        $(pageSelector).replaceWith(thisPage.clone(true).addClass(pageturnEnterClass));
                        pageturn = null;
                        $(window).resize();
                    });
                } else {
                    $('.main').fadeOut('300', function () {
                        replacePage();
                        $(pageSelector).replaceWith(thisPage.clone(true));
                        $('.main').fadeIn('300');
                        $(window).resize();
                    });
                }
            } else {
                ajaxFetchPages();
            }

            stateChange = true;

        }); // end onStateChange

        thisPage.data('title', $('title').text());
        thisPage.data('pagenav', $('.controls .pagenav').first().clone());
        $('.main').data(thisPage.attr('id'), thisPage.clone(true));
        turnToPage(thisPage, true);
    };

    return GM;

}(GM || {}, jQuery));