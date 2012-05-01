/*global QUnit:false, module:false, test:false, asyncTest:false, expect:false*/
/*global start:false, stop:false ok:false, equal:false, notEqual:false, deepEqual:false*/
/*global notDeepEqual:false, strictEqual:false, notStrictEqual:false, raises:false*/
/*global GM:false*/
(function($) {

    /*
    ======== A Handy Little QUnit Reference ========
    http://docs.jquery.com/QUnit

    Test methods:
        expect(numAssertions)
        stop(increment)
        start(decrement)
    Test assertions:
        ok(value, [message])
        equal(actual, expected, [message])
        notEqual(actual, expected, [message])
        deepEqual(actual, expected, [message])
        notDeepEqual(actual, expected, [message])
        strictEqual(actual, expected, [message])
        notStrictEqual(actual, expected, [message])
        raises(block, [expected], [message])
    */

    module('local.js', {
        setup: function() {
            this.elems = $('#qunit-fixture').children();
            this.span1 = $('#qunit-fixture .span1');
            this.span2 = $('#qunit-fixture .span2');
            this.span3 = $('#qunit-fixture .span3');
        }
    });

    test('toggleControls', 4, function() {
        GM.toggleControls(this.span1, this.span2);

        strictEqual(this.elems.filter('.active').length, 0, 'should be no active spans');

        this.span1.click();

        ok(this.span1.hasClass('active'), 'span1 should be active');
        ok(this.span2.hasClass('active'), 'span2 should be active');
        ok(!(this.span3.hasClass('active')), 'span3 should not be active');
    });

}(jQuery));
