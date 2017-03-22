// NB: dependencies: jQuery, lodash (currently globlals)
/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

import velocity from "velocity-animate";
import ps from "perfect-scrollbar/jquery";


// TODO: add perfectScrollbar, allow to set a margin around the viewer
const Viewer = function (options) {
  this.options = _({}).assign({
    $parent: $("body"),
    autoClose: true, // If `open` is called when the viewer is open, the viewer is closed first (if set to false, `open` does nothing)
    className: "viewer",
    duration: 350,
    easing: "easeInOutCubic",
    emptyOnClose: true,
    protectBackground: false, // Add a transparent block below the viewer to prevent interactions with the background (useful when the viewer is not fullsize)
    enableScrollbar: true,
    top: "0px",
    left: "0px",
    width: "100vw",
    height: "100vh"
  }, options).value();

  this.targetCoordinates = {
    top: this.options.top,
    left: this.options.left,
    width: this.options.width,
    height: this.options.height
  };

  this._isOpen = false;
  this.isViewerAnimationRunning = false;

  this.id = ++Viewer.lastId;

  this.$el = $("<div></div>")
    .addClass(this.options.className)
    .attr({
      id: this.options.className + "-" + this.id
    })
    .appendTo(this.options.$parent);


  if (this.options.enableScrollbar === true) {
    this.$el.perfectScrollbar({
      suppressScrollX: true,
      wheelSpeed: 3
    });
  }


  if (this.options.protectBackground === true) {
    this.$protect = $("<div></div>")
    .addClass(this.options.className + "-protect")
    .addClass(this.options.className + "-protect-" + this.id)
    .insertBefore(this.$el);
  }

  this.$content = $("<div></div>")
    .addClass(this.options.className + "-content")
    .appendTo(this.$el);

  this.$close = $("<div></div>")
    .addClass(this.options.className + "-close")
    .appendTo(this.$el)
    .hide();

}


Viewer.lastId = 0;
Viewer.instancesOpen = [];
Viewer.isCloseKeyEventAttached = false;


Viewer.prototype = (function () {
  "use strict";
  var self;

  function $content () {
    return this.$el.children(self.options.className + "-content");
  }


  function $el () {
    return this.$el;
  }


  function $source () {
    return this.$source;
  }


  function close () {
    if (this._isOpen === false || this.isViewerAnimationRunning === true) {
      return;
    }

    this.isViewerAnimationRunning = true;

    if (this.options.protectBackground === true) {
      this.$protect.hide();
    }

    this.$close.hide();

    if (!!this.options.emptyOnClose) {
      this.$content.empty();
    }

    this.$el
    .velocity(coordinates(this.$prevSource), {
      duration: this.options.duration,
      easing: this.options.easing,
      complete: () => {
        this.$el.hide();
        Viewer.instancesOpen.pop();

        if (Viewer.instancesOpen.length === 0) {
          Viewer.isCloseKeyEventAttached = false;
        } else {
          attachCloseKeyEvent();
        }

        this._isOpen = false;
        this.isViewerAnimationRunning = false;
        $.publish(this.options.className + ".close");
      }
    });
  }


  function isOpen() {
    return !!this._isOpen;
  }


  function open ($source) {
    this.$source = $source;

    if (this._isOpen === true || this.isViewerAnimationRunning === true) {
      if (this.options.autoClose === false) {
        return;
      } else {
        this.close();
        this.one("viewer.close", () => {
          this.open($source);
        });
        return;
      }
    }

    this.isViewerAnimationRunning = true;

    if (this.options.protectBackground === true) {
      this.$protect.show();
    }

    this.$el
    .show()
    .css(coordinates(this.$source))
    .velocity(this.targetCoordinates, {
      duration: this.options.duration,
      easing: this.options.easing,
      complete: () => {
        this.$close
        .show()
        .one("click", () => {
          this.close();
        });

        if (this.options.enableScrollbar === true) {
          this.$el.scrollTop(0).perfectScrollbar("update");
        }

        Viewer.instancesOpen.push(this);

        if (Viewer.isCloseKeyEventAttached === false) {
          attachCloseKeyEvent();
        }

        this._isOpen = true;
        this.isViewerAnimationRunning = false;
        this.$prevSource = this.$source; // NOTE: this enables to close a viewer while it has been requested to open on another source
        $.publish(this.options.className + ".open");
      }
    });
  }


  function off (event, callback) {
    $.unsubscribe(event, callback);
  }


  function on (event, callback) {
    $.subscribe(event, callback);
  }


  function one (event, callback) {
    $.subscribe(event, () => {
      callback();
      $.unsubscribe(event);
    });
  }


  // Private functions


  function coordinates ($el) {
    if (!!$el) {
      return {
        left: $el.offset().left - $("html").scrollLeft() + "px",
        top: $el.offset().top - $("html").scrollTop() + "px",
        width: $el.outerWidth(false) + "px",
        height: $el.outerHeight(false) + "px"
      };
    } else {
      return {
        left: "0px",
        top: "0px",
        width: "0px",
        height: "0px"
      };
    }
  }

 // Closing a viewer with the escape key requires some extra work because we want to close only the latest viewer opened
  function attachCloseKeyEvent () {
    $(document).on("keydown", (e) => {
      if (e.which === 27) {
        $(document).off("keydown");
        _.last(Viewer.instancesOpen).$close.addClass("on");
      }
    });

    $(document).on("keyup", (e) => {
      if (e.which === 27) {
        $(document).off("keyup");
        let instance = _.last(Viewer.instancesOpen);
        instance.$close.removeClass("on");
        instance.close();
      }
    });

    Viewer.isCloseKeyEventAttached = true;
  }


  return {
    $content: $content,
    $el: $el,
    $source: $source,
    close: close,
    isOpen: isOpen,
    off: off,
    on: on,
    one: one,
    open: open
  };
})();

export default Viewer;