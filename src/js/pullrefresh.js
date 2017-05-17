(function(window) {
  'use strict';
  class PubSub {

    constructor() {
      this.handlers = [];
    }

    subscribe(event, handler, context) {

      if (typeof context === 'undefined') {
        context = handler;
      }

      this.handlers.push({
        event: event,
        handler: handler.bind(context)
      });

      return this;
    }

    publish(event, ...args) {
      let i = 0;

      for (; i < this.handlers.length; i += 1) {

        if (this.handlers[i].event === event) {
          this.handlers[i].handler(...args);
        }

      }
    }
  }

  class Pan {

    constructor(options = {resistance: 1}) {
      this._options = options;

      this.reset();
    }

    get distance() {
      return this._distance;
    }

    get isScrolling() {
      return this._isScrolling;
    }

    get didMove() {
      return this._didMove;
    }

    get movedBefore() {
      return this._movedBefore;
    }

    reset() {
      this._distance = 0;
      this._start = 0;
      this._isScrolling = false;
      this._didMove = false;
      this._movedBefore = false;
    }

    begin(val) {
      this._start = val;
    }

    calcDistance(pos) {
      return Math.round((pos - this._start) / this._options.resistance);
    }

    move(distance) {
      this._distance = distance;
      this._didMove = true;
      this._movedBefore = true;
      this._isScrolling = false;
    }

    scroll() {
      this._isScrolling = true;
      this._didMove = false;
    }

  }

  class PullRefresh extends Pan {

    constructor() {

      super(...arguments);

      this._el = this._options.el;

      this._options.threshold = this._options.threshold || 0;

      this._state = {};

      this.pubSub = new PubSub();

    }

    get el() {
      return this._el;
    }

    get state() {
      return this._state;
    }

    reset() {
      super.reset();
      this.resetState();
    }

    resetState() {
      this._state = {};
    }

    isScrolledToTop() {
      return this._el.scrollTop === 0;
    }

    move(pos, event) {

      let distance = this.calcDistance(pos);

      if ((!this.isScrolling && this.isScrolledToTop() && distance > 0) || // check if the user pulled down
        (!this.isScrolling && !this.isScrolledToTop() && distance > 0 && this.movedBefore)) { // check if the user pulls up after pulling down beforehand

        super.move(distance);

        this._state.refresh = this.distance > this._options.threshold;
        this._state.pull = this.distance > 0;

        this.pubSub.publish('moved', this);

        return true;
      }
      else {

        this.scroll();

        return false;
      }

    }


    end() {

      if (this.didMove) {

        this.pubSub.publish('end', this);

        this.reset();

        return true;
      }
    }


  }

  window.PullRefresh = PullRefresh;
})(window);