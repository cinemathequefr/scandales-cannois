import moment from "moment";
import Viewer from "./viewer.js";
import timeline from "./timeline.js";
// import dz from './deepzoom.js';
import route from 'riot-route';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set mustache-style interpolate delimiters
moment.locale("fr", { monthsShort: "jan_fév_mar_avr_mai_juin_juil_aoû_sep_oct_nov_déc".split("_"), weekdaysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_") });

var offsetX = 400;
var factor = 1.25;

var template = {
  thumb: _.template([
    "<div class='thumb-cont' data-code='{{ code }}'>",
      "<div class='thumb' style='background-image:url(img/300/{{ id }}.jpg);'></div>",
      "<div class='thumb-gauge'><div class='thumb-gauge-level'></div></div>",
      "<div class='thumb-text'>{{ festYear }}</div>",
    "</div>",
  ].join("")),
  content: _.template([
    "<div class='content'>",
      "<h1><em>{{ date.format('D MMM YYYY') }}</em><br>{{ title }}</h1>",
      "<div class='text'>{{ text }}</div>",
      "<% _(media).forEach(function (m) { %>",
        "<div class='media-container {{ m.type }}'>",
          "<% if (m.type === 'img') { %>",
            "<img src='img/{{ m.name }}.jpg' alt='{{ m.title.replace(/(<([^>]+)>)/gi, '') }}' title='{{ m.title.replace(/(<([^>]+)>)/gi, '') }}' data-media='{{ JSON.stringify(m) }}'>",
          "<% } else if (m.type === 'video') { %>",
            "<iframe src='{{ m.url }}' width='{{ m.size[0] }}' height='{{ m.size[1] }}' frameborder='0' scrolling='no'></iframe>",
          "<% } %>",
          "<div class='legend'>{{ m.title }}</div>",
        "</div>",
      "<% }); %>",
    "</div>"
  ].join(""))
};


$(function () {
  $.getJSON("data/data.json").then(run);
});


function run (data) {
  var v;
  var scroller;

  data = _(data)
  .sortBy("date")
  .map(
    item => _(item)
      .assign({
        date: moment(item.date),
        festYear: parseInt((item.date).match(/^\d{4}/)[0], 10) // Festival year
      })
      .value()
  )
  .value();

  _(data)
  .forEach(item => {
    $("<div class='thumb-sizer size4'></div>")
    // $("<div class='thumb-sizer size" +  ([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4][item.note] || 1) + "'></div>")
    .css({
      // top: ([65, 50, 35][item.y - 1] - _.random(0, 5, true)) + "vh",
      top: ([60, 40, 20][item.y - 1] - _.random(0, 5, true)) + "vh",
      left: (item.x * factor + offsetX) + "px",
    })
    .appendTo($(".content-scroller"))
    .html(template.thumb(item))
    .children(".thumb-cont")
    .data("item", item);

    gauge(item).on();
  });


  $(window).scroll(() => {
    console.log($(".content-scroller").scrollLeft());
  });

  scroller = new IScroll(".content-wrapper", {
    scrollY: false,
    scrollX: true,
    scrollbars: false,
    mouseWheel: true,
    tap: true
  });

  // drop($("svg.title path"), 0, 75, false, "bounceInUp");
  // drop($(".thumb-cont"), 200, 10, true, "bounceInDown");

  v = new Viewer({
    width: "100vw",
    enableRequestClose: true
  });

  $(".thumb-cont").on("tap", function() { // https://github.com/cubiq/iscroll#optionstap
    route("/" + $(this).data("code"));
  });

  v.on("viewer.requestClose", () => {
    route("/");
  });

  v.on("viewer.open", () => {
    var d = v.$source.data("item");
    v.$content.html(template.content(d));
    var $thumb = v.$content.find(".media-container.dz > img");

    $thumb.on("click", () => {
      let width = $thumb.data("media").size[0];
      let height = $thumb.data("media").size[1];
    });
  });

  route("/", function () {
    v.close();
  });

  route("/*", function (code) {
    var $source = $(".thumb-cont[data-code=" + code + "]");
    if ($source.length > 0) {
      scroller.scrollToElement($source.get(0), 250, true, true, IScroll.utils.ease.quadratic);
      window.setTimeout(() => {
        v.open($source);
      }, 275);
    } else {
      route("/");
    }
  });

  route(function () { // Fallback
    route("/");
  });

  route.start(true);
}

/*
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
*/


function gauge (item) {
  var $level = $(".thumb-cont[data-code='" + item.code + "']").find(".thumb-gauge-level");
  return {
    on: function () {
      $(this).off();
      window.setTimeout(() => {
        $level.css({
          bottom: (item.note * 10) + "%"
        });        
      }, 200);
    },
    off: function () {
      $level.css({ bottom: 0 });
    }
  };
}
