function toggleControls(toggle,controls) {
  var doToggle = function() {
    $(controls).toggleClass('active');
    $(toggle).toggleClass('active');
    return false;
  }
  //doToggle();
  $(toggle).click(doToggle);
}

function bodyHeight(element) {
  var updateHeight = function (target) {
    $(target).css('height', $(window).height());
  };
  updateHeight(element);
  $(window).resize(function () {
    $.doTimeout(250, function () {
      updateHeight(element);
    });
  });
}

$(function() {
  $('input[placeholder], textarea[placeholder]').placeholder();
  toggleControls('#toggle','.controls');
  bodyHeight('body');
});