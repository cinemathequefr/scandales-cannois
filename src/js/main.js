import Viewer from "./viewer.js";
import timeline from "./timeline.js";
import moment from "moment";
import scale from './scale.js';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set mustache-style interpolate delimiters
moment.locale("fr", { monthsShort: "jan_fév_mar_avr_mai_juin_juil_aoû_sep_oct_nov_déc".split("_"), weekdaysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_") });



$(function () {
  $.getJSON("data/data.json").then(run);
});



function run (data) {


  // scale.init(data);
  // console.log(scale.data());

  data = _(data)
  .sortBy("date")
  .map(
    item => _(item)
      .assign({
        date: moment(item.date)
      })
      .value()
  )
  .value();

  _(data)
  .forEach(item => {

    $("<div class='thumb-cont'></div>")
    .css({
      top: ([65, 50, 35][item.y - 1] - _.random(0, 5, true)) + "vh",
      left: (item.x) + "px",
      backgroundImage: "url(img/" + item.id + ".jpg)"
    })
    .data("item", item)
    .appendTo($(".content-scroller"))
    .append("<div class='thumb'></div>")
    .children(".thumb")
    .html("<span>" + item.date.format("D MMM YYYY") + "</span>");

    // console.log(c);
  });


  var myScroll = new IScroll(".content-wrapper", {
    scrollY: false,
    scrollX: true,
    scrollbars: false,
    mouseWheel: true,
  });

  drop($("svg.title path"), 0, 100, false, "bounceInUp");
  drop($(".thumb-cont"), 200, 10, true, "bounceInDown");

  var v = new Viewer({
    width: "50vw"
  });

  $(".thumb-cont").on("click", function() {
    v.open($(this));
  });

  v.on("viewer.open", () => {
    var d = v.$source.data("item");
    v.$content.html("<h1>" + d.date.format("D MMM YYYY") + "<br>" + d.title + "</h1>");

  });
}





function drop($elems, delay, duration, shuffle, animationType) {
  $elems.hide().addClass("animated");
  window.setTimeout(
    function() {
      _($elems)
        .thru(function(items) {
          return (!!shuffle ? _(items).shuffle().value() : _(items).value());
        })
        .forEach(function(item, i) {
          _.delay(function() {
            $(item).show().addClass($(item).data("anim") || animationType || "bounceInDown");
          }, i * (duration || 50));
        });
    },
    (delay || 0)
  );
}