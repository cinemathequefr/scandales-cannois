// Hard dependency: jQuery, OpenSeadragon (currently loaded as a global -- no support for CommonJS modules)
// Soft dependency: jQueryUI slider, (spotlight?)
// console.log(OpenSeadragon);

var isOpen = false;
var osd;

function open ($el, src, width, height, options) {
  options = { zoomControls: true }; // TODO: options and defaults

  osd = OpenSeadragon({
    id: "dz-view", // TODO: make sure $el has this id
    autoHideControls: true,
    wrapHorizontal: false, // Horizontal repeat
    wrapVertical: false, // Vertical repeat
    animationTime: 1.5,
    minZoomImageRatio: .5, // (Min size relative to viewport size)
    maxZoomPixelRatio: 3, // (Max size relative to real-size pixel image)
    showNavigationControl: false, // Important
    showNavigator: false,
    mouseNavEnabled: true,
    preserveViewport: false, // Sequence: preserve zoom level and position when navigating between images
    visibilityRatio: 0.5, // Default: 0.5
    zoomPerClick: 1.4, // Default: 2
    zoomPerScroll: 1.1 // Default: 1.2,
  });

  osd.open({  
    Image: {
      xmlns: "http://schemas.microsoft.com/deepzoom/2008",
      Url: src,
      Format: "jpg",
      Overlap: "1",
      TileSize: "256",
      Size: { Height: height.toString(), Width: width.toString() }
    }
  });

  if (options.zoomControls == true && typeof $.fn.slider === "function") { // Soft dependency: jQueryUI slider

    // $el.html("<div class='dzzoomcontrols'><div class='dzscalebutton minus'></div><div class='dzslider'></div><div class='dzscalebutton plus'></div></div>");
    $("<div class='dzzoomcontrols'><div class='dzscalebutton minus'></div><div class='dzslider'></div><div class='dzscalebutton plus'></div></div>").appendTo($el);
    var $slider = $el.find(".dzslider");

    osd.addHandler("open", function () {
      $slider.slider({
        min: minZoomLevel(),
        max: maxZoomLevel(),
        value: currentZoomLevel(),
        slide: function (e, r) {
          return osd.viewport.zoomTo(reverseZoomLevel(r.value));
        }
      });

      osd.addHandler("zoom", function () {
        $slider.slider({ value: currentZoomLevel() });
      });

      $(".dzscalebutton.minus").on("click", zoomOut);
      $(".dzscalebutton.plus").on("click", zoomIn);
    });
  }
}

function destroy() {
  osd.destroy();
}

function convertZoomLevel (level) { // OSD zoom to UI zoom
  return 100 * Math.log(level / osd.viewport.getMinZoom()) / Math.log(2);
}

function reverseZoomLevel (level) { // UI zoom to OSD zoom
  return osd.viewport.getMinZoom() * Math.pow(2, level / 100)
}

function minZoomLevel () {
  let t = osd.viewport;
  return convertZoomLevel(null != t ? t.getMinZoom() : void 0);
}

function maxZoomLevel () {
  let t = osd.viewport;
  return convertZoomLevel(null != t ? t.getMaxZoom() : void 0);
}

function currentZoomLevel () {
  let t = osd.viewport;
  return convertZoomLevel(null != t ? t.getZoom() : void 0);
}

function zoomIn () {
  return triggerZoomBy(osd.zoomPerClick);
}

function zoomOut () {
  return triggerZoomBy(1 / osd.zoomPerClick);
}

function triggerZoomBy (t) {
  osd.viewport.zoomBy(t);
  osd.viewport.applyConstraints(); // NB: method not documented (http://openseadragon.github.io/docs/symbols/OpenSeadragon.Viewport.html#applyConstraints)
}

export default {
  destroy: destroy,
  open: open
};





/**
 * deepZoom
 * Hard dependencies: jQuery, openseadragon
 * Soft dependencies: jQueryUI slider, (spotlight?)
 * 2016-10-18
 */
/*
var deepZoom = (function () {
  var isOpen = false;
  var osd;

  function open($el, src, width, height, options) {

    options = { zoomControls: true }; // TODO: options and defaults

    osd = OpenSeadragon({
      id: "dz-view",
      autoHideControls: true,
      wrapHorizontal: false, // Horizontal repeat
      wrapVertical: false, // Vertical repeat
      animationTime: 1.5,
      minZoomImageRatio: .5, // (Min size relative to viewport size)
      maxZoomPixelRatio: 3, // (Max size relative to real-size pixel image)
      showNavigationControl: false, // Important
      showNavigator: false,
      mouseNavEnabled: true,
      preserveViewport: false, // Sequence: preserve zoom level and position when navigating between images
      visibilityRatio: 0.5, // Default: 0.5
      zoomPerClick: 1.4, // Default: 2
      zoomPerScroll: 1.1 // Default: 1.2,
    });

    osd.open({
      Image: {
        xmlns: "http://schemas.microsoft.com/deepzoom/2008",
        Url: src,
        Format: "jpg",
        Overlap: "1",
        TileSize: "256",
        Size: { Height: height.toString(), Width: width.toString() }
      }
    });

    if (options.zoomControls == true && typeof $.fn.slider === "function") { // Soft dependency: jQueryUI slider
      $("<div class='dzzoomcontrols'><div class='dzscalebutton minus'></div><div class='dzslider'></div><div class='dzscalebutton plus'></div></div>").appendTo($el);
      $slider = $el.find(".dzslider");

      osd.addHandler("open", function () {
        $slider.slider({
          min: minZoomLevel(),
          max: maxZoomLevel(),
          value: currentZoomLevel(),
          slide: function (e, r) {
            return osd.viewport.zoomTo(reverseZoomLevel(r.value));
          }
        });

        osd.addHandler("zoom", function () {
          $slider.slider({ value: currentZoomLevel() });
        });

        $(".dzscalebutton.minus").on("click", zoomOut);
        $(".dzscalebutton.plus").on("click", zoomIn);
      });
    }
  }


  function destroy() {
    osd.destroy();
  }


  function convertZoomLevel (level) { // OSD zoom to UI zoom
    return 100 * Math.log(level / osd.viewport.getMinZoom()) / Math.log(2);
  }

  function reverseZoomLevel (level) { // UI zoom to OSD zoom
    return osd.viewport.getMinZoom() * Math.pow(2, level / 100)
  }

  function minZoomLevel () {
    return convertZoomLevel(null != (t = osd.viewport) ? t.getMinZoom() : void 0);
  }

  function maxZoomLevel () {
    return convertZoomLevel(null != (t = osd.viewport) ? t.getMaxZoom() : void 0);
  }

  function currentZoomLevel () {
    return convertZoomLevel(null != (t = osd.viewport) ? t.getZoom() : void 0);
  }

  function zoomIn () {
    return triggerZoomBy(osd.zoomPerClick);
  }

  function zoomOut () {
    return triggerZoomBy(1 / osd.zoomPerClick);
  }

  function triggerZoomBy (t) {
    osd.viewport.zoomBy(t);
    osd.viewport.applyConstraints(); // NB: method not documented (http://openseadragon.github.io/docs/symbols/OpenSeadragon.Viewport.html#applyConstraints)
  }

  return {
    open: open,
    destroy: destroy
  };

})();
*/