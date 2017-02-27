$(function () {

  drop($("svg.title path"), 0, 100, false);
  drop($(".thumb"), 1500, 25, true);

  viewer.init($("#viewer"), "");
  $(".thumb").on("click", function () {
    viewer.open($(this));
  });

});


function drop ($elems, delay, duration, shuffle) {
  $elems.hide().addClass("animated");
  window.setTimeout(
    function () {
      _($elems)
      .thru(function (items) {
        return (!!shuffle ? _(items).shuffle().value() : _(items).value());
      })
      .forEach(function (item, i) {
        _.delay(function () {
          $(item).show().addClass("bounceInDown")
        }, i * (duration || 50));
      })
    },
    (delay || 0)
  )
}
