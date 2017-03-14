import m from "malihu-custom-scrollbar-plugin";
m(jQuery);

var timeline = {};

$(function () {
  $(".container").mCustomScrollbar({
    axis: "x",
    scrollbarPosition: "inside",
    advanced: { autoExpandHorizontalScroll: true }
  });
});





export default timeline;