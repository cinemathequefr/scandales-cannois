var viewer = (function () {

  var isOpen = false;
  var scaleRatio = 40;
  var duration = 350;
  var $sourceElem;
  var template;
  var $viewer;
  var $viewerClose;
  var $viewerContent;
  var $document = $(document);
  var isViewerAnimationRunning = false;

  function init(_$viewer, templateString) {
    $viewer = _$viewer;
    template = _.template(templateString);
    $viewer.css({ width: "0px", height: "0px" });
    $viewer.append("<div class='viewerContent'></div><div class='viewerClose'></div>");
    $viewerContent = $viewer.children(".viewerContent");
    $viewerClose = $viewer.children(".viewerClose").hide();
    // $viewer.perfectScrollbar({
    //   suppressScrollX: true,
    //   wheelSpeed: 3
    // });          
  }


  // function coordinates($el) {
  //   return {
  //     left: $el.offset().left - $("html").scrollLeft(),
  //     top: $el.offset().top - $("html").scrollTop(),
  //     width: $el.width(),
  //     height: $el.height()
  //   };
  // }
  function coordinates($el) {
    if (!!$el) {
      return {
        left: $el.offset().left - $("html").scrollLeft(),
        top: $el.offset().top - $("html").scrollTop(),
        width: $el.width(),
        height: $el.height()
      };
    } else { return { left: 0, top: 0, width: 0, height: 0 }; }
  }


  function on(event, callback) {
    $.subscribe(event, callback);
  }

  function open(_$sourceElem) {
    if (isOpen === true || isViewerAnimationRunning === true) return;

    $sourceElem = _$sourceElem;
    var coords = coordinates($sourceElem);

    $viewer
    .css({
      border: "solid 0px transparent", // NB: when no $sourceElem is given, the animation doesn't seem to run without this
      top: coords.top + "px",
      left: coords.left + "px",
      width: coords.width + "px",
      height: coords.height + "px",
      "transition-duration": "1ms"
    })
    .one("transitionend", function () {
      isViewerAnimationRunning = true;
      $viewer
      .css({
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        "transition-duration": duration + "ms",
        "transition-timing-function": "cubic-bezier(0.420, 0.000, 0.580, 1.000)"
      });

      window.setTimeout(function () {
        $viewer.one("transitionend", function () {
          $("body").addClass("viewer-isopen");
          $viewerContent.append(template($sourceElem));
          $viewer
          .css({ "transition-duration": "0ms" }) // Important to prevent $viewer animation on window resize
          // $viewer.scrollTop(0).perfectScrollbar("update");
          $viewerClose.show();
          $viewerClose.one("click", close);
          $document.on("keydown", function(e) {
            if (e.which === 27) {
              $document.off("keydown");
              $viewerClose.addClass("on");
            }
          });
          $document.on("keyup", function (e) { // Close with Escape key
            if (e.which  === 27) {
              $document.off("keyup");
              $viewerClose.removeClass("on");
              close();
            }
          });
          isOpen = true;
          isViewerAnimationRunning = false;
          $.publish("viewer.open", { source: $sourceElem });
        });
      }, 1); // Small delay necessary to separate the transitionend events
    });
  }


  function close() {
    if (isOpen === false || isViewerAnimationRunning === true) return;
    var coords = coordinates($sourceElem);
    isViewerAnimationRunning = true;
    $("body").removeClass("viewer-isopen");
    $viewerClose.hide();
    $viewerContent.empty();
    $viewer
    .css({
      top: coords.top + "px",
      left: coords.left + "px",
      width: coords.width + "px",
      height: coords.height + "px",
      "transition-duration": duration + "ms",
      "transition-timing-function": "cubic-bezier(0.420, 0.000, 0.580, 1.000)"
    })
    .one("transitionend", function () {
      // $sourceElem.css({ cursor: "pointer" }); // Trick to force mouse pointer back to pointer (NB: commented out - we should not assume that it was the case)
      $viewer.css({ width: "0px", height: "0px", "transition-duration": "0ms" });
      isOpen = false;
      isViewerAnimationRunning = false;
      $.publish("viewer.close");
    });
  }

  function source () {
    return $sourceElem;
  }

  return {
    close: close,
    init: init,
    on: on,
    open: open
  };
})();
