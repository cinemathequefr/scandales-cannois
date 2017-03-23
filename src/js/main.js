import Viewer from "./viewer.js";
import timeline from "./timeline.js";
import moment from "moment";
import scale from './scale.js';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set mustache-style interpolate delimiters
moment.locale("fr", { monthsShort: "jan_fév_mar_avr_mai_juin_juil_aoû_sep_oct_nov_déc".split("_"), weekdaysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_") });

var template = {
  thumb: _.template([
    "<div class='thumb' style='background-image:url(img/240x200/{{ id }}-1.jpg);'>",
      "<div class='thumb-overlay'></div>",
      "<div class='thumb-date'>{{ date.format('D MMM YYYY') }}</div>",
    "</div>"
  ].join(""))
}


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
    .html(template.thumb(item));
    // .html([
    //   "<div class='thumb' style='background-image:url(img/240x200/" + item.id + "-1.jpg);'>",
    //   "<div>",
    //   "<span>" + item.date.format("D MMM YYYY") + "</span>",
    //   "</div>",
    //   "</div>"
    // ].join("")
    // );



    // console.log(c);
  });


  var myScroll = new IScroll(".content-wrapper", {
    scrollY: false,
    scrollX: true,
    scrollbars: false,
    mouseWheel: true,
    tap: true
  });

  drop($("svg.title path"), 0, 100, false, "bounceInUp");
  drop($(".thumb-cont"), 200, 10, true, "bounceInDown");

  var v = new Viewer({
    width: "50vw"
  });

  var w = new Viewer({
    width: "100vw",
    enableScrollbar: false
  });

  $(".thumb-cont").on("tap", function() { // https://github.com/cubiq/iscroll#optionstap
    v.open($(this));
  });

  v.on("viewer.open", () => {
    var d = v.$source.data("item");
    v.$content.html("<h1>" + d.date.format("D MMM YYYY") + "<br>" + d.title + "</h1><div class='text'>" + d.text + "</div><img src='img/" + d.id + "-1.jpg'>");
    var $thumb = v.$content.find("img");
    $thumb.on("click", () => { w.open($thumb); });
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