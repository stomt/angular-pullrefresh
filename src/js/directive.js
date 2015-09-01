(function() {
  'use strict';

  class PubSub {

    constructor () {
      this.handlers = [];
    }

    subscribe (event, handler, context) {

      if (typeof context === 'undefined') {
        context = handler;
      }

      this.handlers.push({
        event: event,
        handler: handler.bind(context)
      });

      return this;
    }

    publish (event, ...args) {
      let i = 0;

      for (; i < this.handlers.length; i += 1) {

          if (this.handlers[i].event === event) {
              this.handlers[i].handler(...args);
          }

      }
    }
  }


  class Pan {

  constructor (options = {resistance : 1}) {
    this._options = options;

    this.reset();
  }

  get distance () {
    return this._distance;
  }

  get isScrolling () {
    return this._isScrolling;
  }

  get didMove () {
    return this._didMove;
  }

  reset () {
    this._distance = 0;
    this._start = 0;
    this._isScrolling = false;
    this._didMove = false;
  }

  begin (val) {
    this._start = val;
  }

  calcDistance (pos) {
    return Math.round((pos - this._start) / this._options.resistance);
  }

  move (distance) {
    this._distance = distance;
    this._didMove = true;
    this._isScrolling = false;
  }

  scroll () {
    this._isScrolling = true;
    this._didMove = false;
  }

}

  class PullRefresh extends Pan {

    constructor () {

      super(...arguments);

      this._el = this._options.el;

      this._options.threshold = this._options.threshold || 0;

      this._state = {};

      this.pubSub = new PubSub();

    }

    get el () {
      return this._el;
    }

    get state () {
      return this._state;
    }

    reset () {
      super.reset();
      this.resetState();
    }

    resetState () {
      this._state = {};
    }

    isScrolledToTop () {
      return this._el.scrollTop === 0;
    }

    move (pos, event) {

      let distance = this.calcDistance(pos);

      if (!this.isScrolling &&
        this.isScrolledToTop() &&
        distance > 0) {

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


    end () {

      if (this.didMove) {

        this.pubSub.publish('end', this);

        this.reset();

        return true;
      }
    }


  }


















  'use strict';

  const TOUCH_START = 'touchstart MSPointerDown pointerdown';
  const TOUCH_MOVE = 'touchmove MSPointerMove MSPointerHover pointermove';
  const TOUCH_END = 'touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel';

  const defaults = {
    contentOffset : null,
    threshold : 70,
    resistance : 2.5
  };

  /* istanbul ignore next */
  let angular = window.angular ?
    window.angular :
    'undefined' !== typeof require ?
      require('angular') :
      undefined;

  let pullrefresh = angular.module('pullrefresh', []);




  /* @ngInject */
  pullrefresh.directive('pullrefresh', ['$window', '$document', function($window, $document) {

    return {

      transclude : true,

      restrict: 'EA',

      scope : {
        // make the internal loader state known to external
        // components
        ptrStyle : '=pullrefreshLoaderStyle',

        hideLoader : '=pullrefreshHideLoader',

        // make the callback is evaluated on the parent scope
        pullrefresh : '&'
      },

      templateUrl: 'template/pullrefresh/pullrefresh.html',

      link: linkPullrefreshDirective

    };





    ///////////////////////////////////////////////////////////



    function linkPullrefreshDirective($scope, element, attrs) {

      $scope.contentStyle = {};
      $scope.ptrStyle = {};



      /**
       * Hold all of the merged parameter and default module options
       * @type {object}
       */
      let options = {
        contentOffset : attrs.pullrefreshContentOffset || defaults.contentOffset,
        threshold: attrs.pullrefreshThreshold || defaults.threshold,
        resistance: attrs.pullrefreshResistance || defaults.resistance || 1
      };

      /**
       * Easy shortener for handling adding and removing body classes.
       */
      let ptrEl = element[0] || $document[0].body,
        ptrElClassList = ptrEl.classList;


      /**
       * Holds all information about the current pan action
       */
      let pan = new PullRefresh({
        el : options.scrollable === 'self' ?
          ptrEl :
          $document[0].body,
        threshold : options.threshold,
        resistance : options.resistance
      });




      activate();

      ////////////

      function activate() {
        pan.reset();

        pan.isLoading = false;

        pan.pubSub
        .subscribe('moved', (pan) => {

          ptrElClassList[pan.state.refresh ? 'add' : 'remove']('ptr-refresh');
          ptrElClassList[pan.state.pull ? 'add' : 'remove']('ptr-pull');

          setContentPan(pan);
        });



        pan.pubSub.subscribe('end', (pan) => {
          setContentPan(null);

          if (pan.state.refresh) {
            doLoading(pan);
          } else {
            doReset(pan);
          }

        });

        listen(ptrEl, TOUCH_START, touchStart);
        listen(ptrEl, TOUCH_MOVE, touchMove);
        listen(ptrEl, TOUCH_END, touchEnd);
      }

      function listen(el, evt, handler) {

        evt = evt.split(' ');
        let i = 0;

        while (evt[i] && !(`on${evt[i].toLowerCase()}` in $window)) {
          i += 1;
        }

        if (i < evt.length) {
          evt = evt[i];
        }

        el.addEventListener(evt, handler, false);

      }



      /**
       * Determine whether pan events should apply based on scroll position on panstart
       *
       * @param {object} e - Event object
       */
      function touchStart (e) {

        pan.reset();

        if (pan.isLoading) {
          return;
        }

        let t = e.touches ? e.touches[0] : e;

        pan.begin(t.clientY);

      }

      /**
       * Handle element on screen movement when the pandown events is firing.
       *
       * @param {object} e - Event object
       */
      function touchMove (e) {

        if (pan.isLoading) {
          return;
        }

        let t = e.touches ? e.touches[0] : e;

        if (pan.move(t.clientY)) {
          event.preventDefault();
          event.stopPropagation();
        }

      }

      function touchEnd (e) {

        if (pan.isLoading) {
          return;
        }

        if (pan.end()) {
          event.preventDefault();
          event.stopPropagation();
        }

      }








      /**
       * Set the CSS transform on the content element to move it on the screen.
       */
      function setContentPan (pan) {

        if (pan === null) {

          $scope.contentStyle = {};
          $scope.ptrStyle = {};

        }
        else {

          let offset = getContentOffset(options);

          // in case the default loader is being hidden, use the negative
          // pan distance to keep the loader atop
          let loaderOffset = getLoaderOffset(pan, offset);

            // Use transforms to smoothly animate elements on desktop and mobile devices
          $scope.contentStyle = {
            transform: 'translate3d(0, ' + pan.distance + 'px, 0)',
            webkitTransform: 'translate3d(0, ' + pan.distance + 'px, 0)'
          };

          $scope.ptrStyle = {
            transform: 'translate3d(0, ' + loaderOffset + 'px, 0)',
            webkitTransform: 'translate3d(0, ' + loaderOffset + 'px, 0)'
          };

        }

        $scope.$apply();
      }




      function getContentOffset () {
        return options.contentOffset !== null ?
          options.contentOffset :
          element[0].querySelector('.ptr').offsetHeight;
      }

      function getLoaderOffset (pan, offset) {
        return $scope.hideLoader ?
          (-pan.distance - offset) :
          pan.distance - offset;
      }

      /**
       * Position content and refresh elements to show that loading is taking place.
       */
      function doLoading (pan) {
        pan.isLoading = true;
        ptrElClassList.add('ptr-loading');

        // If no valid loading function exists, just reset elements
        if (!$scope.pullrefresh) {
          return doReset(pan);
        }

        // The loading function should return a promise
        var loadingPromise = $scope.$eval($scope.pullrefresh);

        // For UX continuity, make sure we show loading for at least one second before resetting
        setTimeout(function() {

          if (loadingPromise.then) {
            // Once actual loading is complete, reset pull to refresh
            loadingPromise.then(() => doReset(pan));
          }

        }, 1000);
      };

      /**
       * Reset all elements to their starting positions before any paning took place.
       */
      function doReset (pan) {
        ptrElClassList.remove('ptr-loading');
        ptrElClassList.remove('ptr-refresh');
        ptrElClassList.add('ptr-reset');

        var elClassRemove = function() {
          ptrElClassList.remove('ptr-reset');
          ptrElClassList.remove('ptr-pull');

          pan.el.removeEventListener('transitionend', elClassRemove, false);
        };

        pan.el.addEventListener('transitionend', elClassRemove, false);


        pan.isLoading = false;
      };

    }
  }]);

})();
