(function () {
'use strict';

// NB: dependencies: jQuery, lodash (currently globlals)

/*! Tiny Pub/Sub - v0.7.0 - 2013-01-29
* https://github.com/cowboy/jquery-tiny-pubsub
* Copyright (c) 2013 "Cowboy" Ben Alman; Licensed MIT */
(function(n){var u=n({});n.subscribe=function(){u.on.apply(u,arguments);},n.unsubscribe=function(){u.off.apply(u,arguments);},n.publish=function(){u.trigger.apply(u,arguments);};})(jQuery);


var Viewer = (function () {
  var lastId = 0;

  return function (options) {
    this.options = _({})
      .assign({
        $parent: $("body"),
        className: "viewer",
        duration: 350,
        emptyOnClose: true,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh"
      }, options)
      .value();

    this._isOpen = false;
    this.isViewerAnimationRunning = false;
    this.id = this.options.className + "-" + (++lastId);

    this.$el = $("<div></div>")
      .addClass(this.options.className)
      .attr({ id: this.id })
      .appendTo(this.options.$parent);

    this.$content = $("<div></div>")
      .addClass(this.options.className + "-content")
      .appendTo(this.$el);

    this.$close = $("<div></div>")
      .addClass(this.options.className + "-close")
      .appendTo(this.$el)
      .hide();

  };
})();


Viewer.prototype.open = function ($source) {
  if (this._isOpen === true || this.isViewerAnimationRunning === true) { return; }

  var self = this;
  self.$source = $source;
  var coords = coordinates(self.$source);

  self.$el
  .css({
    border: "solid 0px transparent", // NB: when no $source is given, the animation doesn't seem to run without this
    top: coords.top + "px",
    left: coords.left + "px",
    width: coords.width + "px",
    height: coords.height + "px",
    "transition-duration": "1ms"
  })
  .one("transitionend", function () {
    self.isViewerAnimationRunning = true;
    self.$el
    .css({
      top: self.options.top,
      left: self.options.left,
      width: self.options.width,
      height: self.options.height,
      "transition-duration": self.options.duration + "ms",
      "transition-timing-function": "cubic-bezier(0.420, 0.000, 0.580, 1.000)"
    });

    window.setTimeout(function () {

      self.$el.one("transitionend", function () {

        $("body").addClass(self.className + "-isopen");
        // this.$content.append(template($source));
        self.$el
        .css({ "transition-duration": "0ms" }); // Important to prevent $viewer animation on window resize
        // $viewer.scrollTop(0).perfectScrollbar("update");
        self.$close.show();
        self.$close.one("click", function () { self.close(); });

        $(document).on("keydown", function(e) {
          if (e.which === 27) {
            $(document).off("keydown");
            self.$close.addClass("on");
          }
        });

        $(document).on("keyup", function (e) { // Close with Escape key
          if (e.which  === 27) {
            $(document).off("keyup");
            self.$close.removeClass("on");
            self.close();
          }
        });
        self._isOpen = true;
        self.isViewerAnimationRunning = false;
        self.$prevSource = self.$source; // NOTE: this enables to close a viewer while it has been requested to open on another source
        $.publish(self.options.className + ".open", { source: self.$prevSource });
      });
    }, 1); // Small delay necessary to separate the transitionend events
  });
};


/**
 *
 * Note: Trying to close a closed viewer doesn't trigger a `close` event. (Clients can use the `isOpen` method to check the viewer's status.)
 */
Viewer.prototype.close = function () {
  if (this._isOpen === false || this.isViewerAnimationRunning === true) { return; }

  var self = this;
  var coords = coordinates(self.$prevSource);

  self.isViewerAnimationRunning = true;
  $("body").removeClass(self.options.className + "-isopen");
  self.$close.hide();

  if (!!self.options.emptyOnClose) {
    self.$content.empty();
  }

  window.setTimeout(function () {
    self.$el
    .css({
      top: coords.top + "px",
      left: coords.left + "px",
      width: coords.width + "px",
      height: coords.height + "px",
      "transition-duration": self.options.duration + "ms",
      "transition-timing-function": "cubic-bezier(0.420, 0.000, 0.580, 1.000)"
    })
    .one("transitionend", function () {
      // self.$source.css({ cursor: "pointer" }); // Trick to force mouse pointer back to pointer (NB: commented out - we should not assume that it was the case)
      self.$el.css({ width: "0px", height: "0px", "transition-duration": "0ms" });
      self._isOpen = false;
      self.isViewerAnimationRunning = false;
      $.publish(self.options.className + ".close");
    });
  }, 10);

};

Viewer.prototype.off = function (event, callback) {
  $.unsubscribe(event, callback);
};

Viewer.prototype.on = function (event, callback) {
  $.subscribe(event, callback);
};

Viewer.prototype.one = function (event, callback) {
  $.subscribe(event, function () {
    callback();
    $.unsubscribe(event);
  });
};

Viewer.prototype.$el = function () {
  return this.$el;
};

Viewer.prototype.$content = function () {
  return this.$el.children(self.options.className + "-content");
};

Viewer.prototype.isOpen = function () {
  return !!this._isOpen;
};

function coordinates ($el) {
  if (!!$el) {
    return {
      left: $el.offset().left - $("html").scrollLeft(),
      top: $el.offset().top - $("html").scrollTop(),
      width: $el.width(),
      height: $el.height()
    };
  } else { return { left: 0, top: 0, width: 0, height: 0 }; }
}

$(function () {

  var v = new Viewer({
    top: "24px",
    left: "24px",
    width: "50vw",
    height: "calc(100vh - 64px)"
  });

  drop($("svg.title path"), 0, 100, false, "bounceInUp");
  drop($(".thumb"), 2000, 25, true, "bounceInDown");

  v.on("viewer.open", function () {
    v.$content.append("<p>Hullo there!</p>");
  });

  $(".thumb").on("click", function () {
    var this$1 = this;

    if (v.isOpen()) {
      v.close();
      var e = v.one("viewer.close", function () { v.open($(this$1)); }); // NOTE: The arrow function preserves `this`.
    } else {
      v.open($(this));
    }
  });




});


function drop ($elems, delay, duration, shuffle, animationType) {
  $elems.hide().addClass("animated");
  window.setTimeout(
    function () {
      _($elems)
      .thru(function (items) {
        return (!!shuffle ? _(items).shuffle().value() : _(items).value());
      })
      .forEach(function (item, i) {
        _.delay(function () {
          $(item).show().addClass($(item).data("anim") || animationType || "bounceInDown");
        }, i * (duration || 50));
      });
    },
    (delay || 0)
  );
}

}());
//# sourceMappingURL=bundle.js.map
