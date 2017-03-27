import moment from "moment";
import Viewer from "./viewer.js";
import timeline from "./timeline.js";
import dz from './deepzoom.js';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set mustache-style interpolate delimiters
moment.locale("fr", { monthsShort: "jan_fév_mar_avr_mai_juin_juil_aoû_sep_oct_nov_déc".split("_"), weekdaysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_") });

var template = {
  thumb: _.template([
    "<div class='thumb' style='background-image:url(img/240x200/{{ id }}.jpg);'>",
      "<div class='thumb-overlay'></div>",
      "<div class='thumb-date'>{{ date.format('D MMM YYYY') }}</div>",
    "</div>"
  ].join("")),
  content: _.template([
    "<div class='content'>",
      "<h1>{{ date.format('D MMM YYYY') }}<br>{{ title }}</h1>",
      "<div class='text'>{{ text }}</div>",
      "<% _(media).forEach(function (m) {",
      "if (m.type === 'img' || m.type === 'dz') { %>",
        "<div class='media-container {{ m.type }}'>",
          "<img src='img/{{ m.name }}.jpg' alt='{{ m.title.replace(/(<([^>]+)>)/gi, '') }}' title='{{ m.title.replace(/(<([^>]+)>)/gi, '') }}' data-media='{{ JSON.stringify(m) }}'>",
          "<div class='legend'>{{ m.title }}</div>",
        "</div>",
      "<% }",
      "}); %>",
    "</div>"
  ].join(""))
}


$(function () {
  $.getJSON("data/data.json").then(run);
});


function run (data) {
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
    // width: "50vw"
    width: "100vw"
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
    v.$content.html(template.content(d));
    var $thumb = v.$content.find(".media-container.dz > img");

    $thumb.on("click", () => {
      let width = $thumb.data("media").size[0];
      let height = $thumb.data("media").size[1];

      w.open($thumb);


      // BUG in deepzoom: adds one instance on each open
      // w.on("viewer.open", () => {
      //   w.$content.attr("id", "dz-view");
      //   dz.open(w.$content, "http://cf.pasoliniroma.com/static/scandales-cannois/dz/14-1/", width, height);
      // });

      // w.on("viewer.close", () => {
      //   dz.destroy();
      //   console.log(w.$el);
      // });


    });
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