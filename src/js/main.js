import moment from "moment";
import Viewer from "./viewer.js";
import timeline from "./timeline.js";
import route from "riot-route";

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // Set mustache-style interpolate delimiters
moment.locale("fr", { monthsShort: "jan_fév_mar_avril_mai_juin_juil_aoû_sep_oct_nov_déc".split("_"), weekdaysShort: "Dim_Lun_Mar_Mer_Jeu_Ven_Sam".split("_") });

var viewportWidth;

$(window)
.on("resize", () => {
  viewportWidth = $(window).outerWidth();
})
.trigger("resize");

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
  // $.getJSON("data/data.json").then(preload).then(run);
});

// function preload (data) {
//   return new Promise((resolve, reject) => {
//     var queue = new createjs.LoadQueue(true);
//     queue.setMaxConnections(10);
//     queue.loadManifest("../img/300/" + _(data).map("id").value() + ".jpg");
//     queue.on("complete", () => {
//       resolve(data);
//     });
//   });
// }

function run (data) {
  var v;
  var scroller;
  var $items = [];

  data = _(data)


  .sortBy("date")
  .map(
    item => _(item)
      .assign({
        date: moment(item.date),
        festYear: parseInt((item.date).match(/^\d{4}/)[0], 10), // Festival year
        $el: $("<div>"),
        seen: false
      })
      .value()
  )
  .forEach(item => {
    item.$el
    .addClass("thumb-sizer")
    .css({
      top: ([65, 50, 30][item.y - 1] - _.random(0, 5, true)) + "vh",
      left: (item.x) + "px",
    })
    .appendTo($(".content-scroller"))
    .html(template.thumb(item))
    .children(".thumb-cont")
    .data("item", item);
  });

  v = new Viewer({
    $parent: $(".viewer-placeholder"),
    enableRequestClose: true
  });

  scroller = new IScroll(".content-wrapper", {
    scrollY: false,
    scrollX: true,
    scrollbars: false,
    mouseWheel: true,
    tap: true,
    probeType: 3
  });

  scroller.on("scroll", () => { probeVisibleItems(scroller, data) });
  probeVisibleItems(scroller, data);

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
    updateAnalytics();
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
    updateAnalytics();
    route("/");
  });

  route.start(true);
}


function updateAnalytics () {
  ga("send", "pageview", document.location.href);
}


function probeVisibleItems (scroller, data) {
  var x = -scroller.x;
  var visible = _(data)
  .filter(item => item.seen === false && item.x + 300 >= x && item.x <= x + viewportWidth * 0.66) // The "active" area runs horizontally from 300px to .66% of the viewport
  .forEach((item, i) => {
    window.setTimeout(() => { gauge(item) }, i * 1500);
    item.seen = true;
  });
  if (visible.length === 0) scroller.off("scroll"); // All have been seen - stop listening to the scroll event
}


function gauge (item) {
  $(".thumb-cont[data-code='" + item.code + "']").find(".thumb-gauge-level").css({ bottom: (item.note * 10) + "%" });
}
