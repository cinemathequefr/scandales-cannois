// NB: dependencies: jQuery, lodash (currently globlals)
/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
 * https://github.com/cowboy/jquery-tiny-pubsub
 * Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);

import * as velocity from "velocity-animate"; 

const Viewer = (() => {
  "use strict";
  var lastId = 0;

  return function (options) {
    this.options = _({}).assign({
      $parent: $("body"),
      autoClose: true, // If `open` is called when the viewer is open, the viewer is closed first (if set to false, `open` does nothing)
      className: "viewer",
      duration: 350,
      easing: "easeInOutCubic",
      emptyOnClose: true,
      protectBackground: false, // Add a transparent block below the viewer to prevent interactions with the background (useful when the viewer is not fullsize)
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

    this.id = ++lastId;

    this.$el = $("<div></div>")
      .addClass(this.options.className)
      .attr({
        id: this.options.className + "-" + this.id
      })
      .appendTo(this.options.$parent);

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

    this._initSelf();

  };
})();


Viewer.prototype = (function () {
  "use strict";
  var self;


  function _initSelf () { // This method is to be called once, by the constructor, to give the value of `this` to the closure `self`
    self = this;
  }


  function $content () {
    return self.$el.children(self.options.className + "-content");
  }


  function $el () {
    return self.$el;
  }


  function close () {
    if (this._isOpen === false || this.isViewerAnimationRunning === true) {
      return;
    }

    self.isViewerAnimationRunning = true;

    if (self.options.protectBackground === true) {
      self.$protect.hide();
    }

    $("body").removeClass(self.options.className + "-isopen");

    self.$close.hide();

    if (!!self.options.emptyOnClose) {
      self.$content.empty();
    }

    self.$el
    .velocity(coordinates(self.$prevSource), {
      duration: self.options.duration,
      easing: self.options.easing,
      complete: () => { onClose(self); }
    });
  }


  function isOpen() {
    return !!self._isOpen;
  }


  function open ($source) {
    self.$source = $source;

    if (self._isOpen === true || self.isViewerAnimationRunning === true) {
      if (self.options.autoClose === false) {
        return;
      } else {
        self.close();
        self.one("viewer.close", () => {
          self.open($source);
        });
        return;
      }
    }

    self.isViewerAnimationRunning = true;

    if (self.options.protectBackground === true) {
      self.$protect.show();
    }

    self.$el
    .show()
    .css(coordinates(self.$source))
    .velocity(self.targetCoordinates, {
      duration: self.options.duration,
      easing: self.options.easing,
      complete: () => { onOpen(self); }
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


  function onOpen (self) {
    $("body").addClass(self.className + "-isopen");

    self.$close
    .show()
    .one("click", () => {
      self.close();
    });

    $(document).on("keydown", (e) => {
      if (e.which === 27) {
        $(document).off("keydown");
        self.$close.addClass("on");
      }
    });

    $(document).on("keyup", (e) => { // Close with Escape key
      if (e.which === 27) {
        $(document).off("keyup");
        self.$close.removeClass("on");
        self.close();
      }
    });

    self._isOpen = true;
    self.isViewerAnimationRunning = false;
    self.$prevSource = self.$source; // NOTE: this enables to close a viewer while it has been requested to open on another source
    $.publish(self.options.className + ".open");
  }


  function onClose (self) {
    self.$el.hide();
    self._isOpen = false;
    self.isViewerAnimationRunning = false;
    $.publish(self.options.className + ".close");
  }


  function coordinates ($el) {
    if (!!$el) {
      return {
        left: $el.offset().left - $("html").scrollLeft() + "px",
        top: $el.offset().top - $("html").scrollTop() + "px",
        width: $el.width() + "px",
        height: $el.height() + "px"
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


  return {
    _initSelf: _initSelf,
    $content: $content,
    $el :$el,
    close: close,
    isOpen: isOpen,
    off: off,
    on: on,
    one: one,
    open: open
  };
})();

export default Viewer;