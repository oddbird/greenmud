var GM = (function (GM, $) {

    'use strict';

    // Originally based on https://gist.github.com/854622, by Benjamin Lupton (balupton)
    GM.pageTurning = function () {
        var History = window.History,

        // Prepare Variables
            pageSelector = '.page',
            thisPage = $(pageSelector),
            pageControls = $('.controls'),
            body = $('body'),
            stateChange = false,
            pageturn,
            pageState,
            internalPages,
            // HTML Helper
            documentHtml = function (html) {
                // Prepare
                var result = String(html)
                    .replace(/<\!DOCTYPE[^>]*>/i, '')
                    .replace(/<(html|head|body|title|meta|script)([\s\>])/gi, '<div class="document-$1"$2')
                    .replace(/<\/(html|head|body|title|meta|script)\>/gi, '</div>');

                // Return
                return $.parseHTML(result);
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
        body.on('click', 'a', function (e) {
            var thisLink = $(this).blur();
            var href = thisLink.attr('href');
            var page;
            var fallback = function (link) {
                window.location = link.attr('href');
            };
            stateChange = false;
            // Prev/Next page-turns use classes for css-animation
            if (thisLink.parent().hasClass('prev')) {
                pageturn = 'prev';
            } else if (thisLink.parent().hasClass('next')) {
                pageturn = 'next';
            }
            // Shift-pageturns go directly to prev/next chapter
            if (e.shiftKey && thisLink.data('chapter')) {
                e.preventDefault();
                window.location = thisLink.data('chapter');
            } else {
                // Perform internal page-state change, if applicable
                if (internalPages > 1 && ((pageturn === 'next' && pageState < internalPages) || (pageturn === 'prev' && pageState > 1))) {
                    e.preventDefault();
                    if (pageturn === 'next') {
                        pageState++;
                    } else if (pageturn === 'prev') {
                        pageState--;
                    }
                    $(pageSelector).attr('data-page-state', pageState);
                // Continue as normal for external links, cmd clicks, etc.
                } else if (e.which === 2 || e.metaKey || (href && href.indexOf('http://') === 0)) {
                    return true;
                } else if (href) {
                    e.preventDefault();
                    if (thisLink.hasClass('break')) {
                        fallback(thisLink);
                    } else {
                        if (thisLink.data('id') && body.data(thisLink.data('id')) && History.enabled) {
                            $('#toc, a[rel="contents"]').removeClass('active');
                            page = body.data(thisLink.data('id'));
                            turnToPage(page);
                        } else {
                            fallback(thisLink);
                        }
                    }
                } else {
                    e.preventDefault();
                }
            }
        });

        // LEFT or RIGHT triggers page-turn click
        $(document).keydown(function (e) {
            var link;
            if (e.which === GM.keycodes.LEFT) {
                e.preventDefault();
                link = pageControls.first().find('.pagenav .prev a');
                if (e.shiftKey && link.data('chapter')) {
                    window.location = link.data('chapter');
                } else {
                    link.click();
                }
            }
            if (e.which === GM.keycodes.RIGHT) {
                e.preventDefault();
                link = pageControls.first().find('.pagenav .next a');
                if (e.shiftKey && link.data('chapter')) {
                    window.location = link.data('chapter');
                } else {
                    link.click();
                }
            }
        });

        // SWIPELEFT or SWIPERIGHT gestures trigger page-turn click
        $(document).swipe({
            swipeStatus: function (event, phase, direction, distance) {
                if (phase === 'end') {
                    if (direction === 'left') {
                        pageControls.first().find('.pagenav .next a').click();
                    } else if (direction === 'right') {
                        pageControls.first().find('.pagenav .prev a').click();
                    } else {
                        body.removeClass('swiping-next swiping-prev');
                    }
                } else if (phase === 'cancel') {
                    body.removeClass('swiping-next swiping-prev');
                } else if (phase === 'move') {
                    if (distance >= 50) {
                        if (direction === 'left') {
                            body.removeClass('swiping-prev');
                            if (pageControls.first().find('.pagenav .next a').attr('href')) {
                                body.addClass('swiping-next');
                            }
                        } else if (direction === 'right') {
                            body.removeClass('swiping-next');
                            if (pageControls.first().find('.pagenav .prev a').attr('href')) {
                                body.addClass('swiping-prev');
                            }
                        } else {
                            body.removeClass('swiping-next swiping-prev');
                        }
                    } else {
                        body.removeClass('swiping-next swiping-prev');
                    }
                }
            },
            allowPageScroll: 'vertical',
            fallbackToMouseEvents: false
        });

        if (History.enabled) {
            // Hook into State Changes
            $(window).on('statechange', function () {
                // Prepare Variables
                var state = History.getState().data,
                    title = state.title,
                    exitDuration,
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

                        // Store the content as a data-attr on 'body'
                        body.data(id, dataContent);
                    },
                    ajaxFetchPages = function () {
                        prev = pageControls.first().find('.pagenav .prev a');
                        next = pageControls.first().find('.pagenav .next a');

                        if (!(prev.hasClass('break')) && prev.attr('href') && !(body.data(prev.data('id')))) {
                            // Ajax Request the Prev Page
                            $.get(prev.attr('href'), preparePage);
                        }

                        if (!(next.hasClass('break')) && next.attr('href') && !(body.data(next.data('id')))) {
                            // Ajax Request the Next Page
                            $.get(next.attr('href'), preparePage);
                        }
                    },
                    replacePage = function (newPage, newPageNav) {
                        body.removeClass().addClass(newPage.data('body-class'));
                        document.title = title;
                        $('title').text(title);
                        $.scrollTo(0);

                        pageControls.each(function () {
                            $(this).find('.pagenav').replaceWith(newPageNav.clone());
                        });

                        pageState = newPage.attr('data-page-state');
                        internalPages = newPage.attr('data-internal-pages');

                        ajaxFetchPages();
                    };

                if ($(pageSelector).attr('id') !== state.id) {
                    thisPage = body.data(state.id);
                    pageNav = thisPage.data('pagenav');
                    exitDuration = $(pageSelector).data('exit-duration');
                    if (pageturn === 'prev' || pageturn === 'next') {
                        if (pageturn === 'prev') {
                            pageturnExitClass = 'exit-next';
                            pageturnEnterClass = 'enter-prev';
                            thisPage.attr('data-page-state', thisPage.attr('data-internal-pages'));
                        } else if (pageturn === 'next') {
                            pageturnExitClass = 'exit-prev';
                            pageturnEnterClass = 'enter-next';
                            thisPage.attr('data-page-state', 1);
                        }
                        $(pageSelector).removeClass('enter-prev enter-next').addClass(pageturnExitClass);
                        $.doTimeout(exitDuration ? exitDuration : 300, function () {
                            body.removeClass('swiping-next swiping-prev');
                            replacePage(thisPage, pageNav);
                            $(pageSelector).replaceWith(thisPage.clone(true).addClass(pageturnEnterClass));
                            pageturn = null;
                            $(window).resize();
                        });
                    } else {
                        replacePage(thisPage, pageNav);
                        $(pageSelector).replaceWith(thisPage.clone(true));
                        $(window).resize();
                    }
                } else {
                    ajaxFetchPages();
                }

                stateChange = true;

            }); // end onStateChange

            thisPage.data('title', $('title').text());
            thisPage.data('pagenav', $('.controls .pagenav').first().clone());
            body.data(thisPage.attr('id'), thisPage.clone(true));
            pageState = thisPage.attr('data-page-state');
            internalPages = thisPage.attr('data-internal-pages');
            turnToPage(thisPage, true);
        }
    };

    return GM;

}(GM || {}, jQuery));