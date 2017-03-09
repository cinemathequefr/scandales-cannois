import Viewer from "./viewer.js";





$(function () {

  var v = new Viewer({
    top: "24px",
    left: "24px",
    width: "50vw",
    height: "calc(100vh - 64px)"
  });

  drop($("svg.title path"), 0, 100, false, "bounceInUp");
  drop($(".thumb"), 2000, 25, true, "bounceInDown");

  v.on("viewer.open", () => {
    v.$content.append("<p>Hullo there!</p>");
  });

  $(".thumb").on("click", function () {
    if (v.isOpen()) {
      v.close();
      var e = v.one("viewer.close", () => { v.open($(this)); }); // NOTE: The arrow function preserves `this`.
    } else {
      v.open($(this));
    }
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
