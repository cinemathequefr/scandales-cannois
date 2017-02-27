$(function () {

  drop($("svg.title path"), 0, 100, false, "bounceInUp");
  drop($(".thumb"), 2000, 25, true, "boundInDown");

  viewer.init($("#viewer"), "");
  $(".thumb").on("click", function () {
    viewer.open($(this));
  });

});


function drop ($elems, delay, duration, shuffle, animationType) {
  $elems.hide().addClass("animated");
  window.setTimeout(
    function () {
      _($elems)
      .thru(function (items) {
        return (!!shuffle ? _(items).shuffle().value() : _(items).value());
      })
      .forEach(function (item, i) {
        _.delay(function () {
          $(item).show().addClass($(item).data("anim") || animationType || "bounceInDown")
        }, i * (duration || 50));
      })
    },
    (delay || 0)
  )
}
