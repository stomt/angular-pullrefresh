'use strict';

(function () {
  'use strict';

  var TOUCH_START = 'touchstart MSPointerDown pointerdown';
  var TOUCH_MOVE = 'touchmove MSPointerMove MSPointerHover pointermove';
  var TOUCH_END = 'touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel';

  var defaults = {
    contentOffset: null,
    threshold: 70,
    resistance: 2.5
  };

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  var pullrefresh = angular.module('pullrefresh', []);

  /* @ngInject */
  pullrefresh.directive('pullrefresh', ['$window', '$document', function ($window, $document) {

    return {

      transclude: true,

      restrict: 'EA',

      scope: {
        // make the internal loader state known to external
        // components
        ptrStyle: '=pullrefreshLoaderStyle',

        hideLoader: '=pullrefreshHideLoader',

        // make the callback is evaluated on the parent scope
        pullrefresh: '&',

        pullrefreshElement: '@',

        // allow users to insert an own template for the loader
        pullrefreshTemplate: '@',

        // allows to disable the directive. this does only work before the link function was running
        pullrefreshDisabled: '@'
      },

      templateUrl: getTemplateUrl,

      link: linkPullrefreshDirective

    };

    ///////////////////////////////////////////////////////////

    function getTemplateUrl(elem, attrs) {
      return attrs.pullrefreshTemplate || 'template/pullrefresh/pullrefresh.html';
    }

    function linkPullrefreshDirective($scope, element, attrs) {

      if (attrs.pullrefreshDisabled === 'true') {
        return;
      }

      $scope.contentStyle = {};
      $scope.ptrStyle = {};

      /**
       * Hold all of the merged parameter and default module options
       * @type {object}
       */
      var options = {
        contentOffset: attrs.pullrefreshContentOffset || defaults.contentOffset,
        threshold: attrs.pullrefreshThreshold || defaults.threshold,
        resistance: attrs.pullrefreshResistance || defaults.resistance || 1
      };

      /**
       * Easy shortener for handling adding and removing body classes.
       */
      var ptrEl = $document[0].body;
      if ($scope.pullrefreshElement) {
        var elements = document.querySelectorAll($scope.pullrefreshElement);
        if (elements.length > 0) {
          ptrEl = elements[0];
        }
      }

      var ptrElClassList = ptrEl.classList;

      /**
       * Holds all information about the current pan action
       */
      var pan = new $window.PullRefresh({
        el: ptrEl,
        threshold: options.threshold,
        resistance: options.resistance
      });

      activate();

      ////////////

      function activate() {
        pan.reset();

        pan.isLoading = false;

        pan.pubSub.subscribe('moved', function (pan) {

          ptrElClassList[pan.state.refresh ? 'add' : 'remove']('ptr-refresh');
          ptrElClassList[pan.state.pull ? 'add' : 'remove']('ptr-pull');

          setContentPan(pan);
        });

        pan.pubSub.subscribe('end', function (pan) {
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
        var i = 0;

        while (evt[i] && !('on' + evt[i].toLowerCase() in $window)) {
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
      function touchStart(e) {

        pan.reset();

        if (pan.isLoading) {
          return;
        }

        var t = e.touches ? e.touches[0] : e;

        pan.begin(t.clientY);
      }

      /**
       * Handle element on screen movement when the pandown events is firing.
       *
       * @param {object} e - Event object
       */
      function touchMove(e) {

        if (pan.isLoading) {
          return;
        }

        var t = e.touches ? e.touches[0] : e;

        if (pan.move(t.clientY)) {
          e.stopPropagation();
        }
      }

      function touchEnd(e) {

        if (pan.isLoading) {
          return;
        }

        if (pan.end() && e.cancelable) {
          e.preventDefault();
          e.stopPropagation();
        }
      }

      /**
       * Set the CSS transform on the content element to move it on the screen.
       */
      function setContentPan(pan) {

        if (pan === null) {

          $scope.contentStyle = {};
          $scope.ptrStyle = {};
        } else {

          var offset = getContentOffset(options);

          // in case the default loader is being hidden, use the negative
          // pan distance to keep the loader atop
          var loaderOffset = getLoaderOffset(pan, offset);

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

      function getContentOffset() {
        return options.contentOffset !== null ? options.contentOffset : element[0].querySelector('.ptr').offsetHeight;
      }

      function getLoaderOffset(pan, offset) {
        return $scope.hideLoader ? -pan.distance - offset : pan.distance - offset;
      }

      /**
       * Position content and refresh elements to show that loading is taking place.
       */
      function doLoading(pan) {
        pan.isLoading = true;
        ptrElClassList.add('ptr-loading');

        // If no valid loading function exists, just reset elements
        if (!$scope.pullrefresh) {
          return doReset(pan);
        }

        // The loading function should return a promise
        var loadingPromise = $scope.$eval($scope.pullrefresh);

        // For UX continuity, make sure we show loading for at least one second before resetting
        setTimeout(function () {

          if (loadingPromise.then) {
            // Once actual loading is complete, reset pull to refresh
            loadingPromise.then(function () {
              return doReset(pan);
            });
          }
        }, 1000);
      }

      /**
       * Reset all elements to their starting positions before any paning took place.
       */
      function doReset(pan) {
        ptrElClassList.remove('ptr-loading');
        ptrElClassList.remove('ptr-refresh');
        ptrElClassList.add('ptr-reset');

        var elClassRemove = function elClassRemove() {
          ptrElClassList.remove('ptr-reset');
          ptrElClassList.remove('ptr-pull');

          pan.el.removeEventListener('transitionend', elClassRemove, false);
        };

        pan.el.addEventListener('transitionend', elClassRemove, false);

        pan.isLoading = false;
      }
    }
  }]);
})();
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window) {
  'use strict';

  var PubSub = function () {
    function PubSub() {
      _classCallCheck(this, PubSub);

      this.handlers = [];
    }

    _createClass(PubSub, [{
      key: 'subscribe',
      value: function subscribe(event, handler, context) {

        if (typeof context === 'undefined') {
          context = handler;
        }

        this.handlers.push({
          event: event,
          handler: handler.bind(context)
        });

        return this;
      }
    }, {
      key: 'publish',
      value: function publish(event) {
        var i = 0;

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        for (; i < this.handlers.length; i += 1) {

          if (this.handlers[i].event === event) {
            var _handlers$i;

            (_handlers$i = this.handlers[i]).handler.apply(_handlers$i, args);
          }
        }
      }
    }]);

    return PubSub;
  }();

  var Pan = function () {
    function Pan() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { resistance: 1 };

      _classCallCheck(this, Pan);

      this._options = options;

      this.reset();
    }

    _createClass(Pan, [{
      key: 'reset',
      value: function reset() {
        this._distance = 0;
        this._start = 0;
        this._isScrolling = false;
        this._didMove = false;
        this._movedBefore = false;
      }
    }, {
      key: 'begin',
      value: function begin(val) {
        this._start = val;
      }
    }, {
      key: 'calcDistance',
      value: function calcDistance(pos) {
        return Math.round((pos - this._start) / this._options.resistance);
      }
    }, {
      key: 'move',
      value: function move(distance) {
        this._distance = distance;
        this._didMove = true;
        this._movedBefore = true;
        this._isScrolling = false;
      }
    }, {
      key: 'scroll',
      value: function scroll() {
        this._isScrolling = true;
        this._didMove = false;
      }
    }, {
      key: 'distance',
      get: function get() {
        return this._distance;
      }
    }, {
      key: 'isScrolling',
      get: function get() {
        return this._isScrolling;
      }
    }, {
      key: 'didMove',
      get: function get() {
        return this._didMove;
      }
    }, {
      key: 'movedBefore',
      get: function get() {
        return this._movedBefore;
      }
    }]);

    return Pan;
  }();

  var PullRefresh = function (_Pan) {
    _inherits(PullRefresh, _Pan);

    function PullRefresh() {
      _classCallCheck(this, PullRefresh);

      var _this = _possibleConstructorReturn(this, (PullRefresh.__proto__ || Object.getPrototypeOf(PullRefresh)).apply(this, arguments));

      _this._el = _this._options.el;

      _this._options.threshold = _this._options.threshold || 0;

      _this._state = {};

      _this.pubSub = new PubSub();

      return _this;
    }

    _createClass(PullRefresh, [{
      key: 'reset',
      value: function reset() {
        _get(PullRefresh.prototype.__proto__ || Object.getPrototypeOf(PullRefresh.prototype), 'reset', this).call(this);
        this.resetState();
      }
    }, {
      key: 'resetState',
      value: function resetState() {
        this._state = {};
      }
    }, {
      key: 'isScrolledToTop',
      value: function isScrolledToTop() {
        return this._el.scrollTop === 0;
      }
    }, {
      key: 'move',
      value: function move(pos, event) {

        var distance = this.calcDistance(pos);

        if (!this.isScrolling && this.isScrolledToTop() && distance > 0 || // check if the user pulled down
        !this.isScrolling && !this.isScrolledToTop() && distance > 0 && this.movedBefore) {
          // check if the user pulls up after pulling down beforehand

          _get(PullRefresh.prototype.__proto__ || Object.getPrototypeOf(PullRefresh.prototype), 'move', this).call(this, distance);

          this._state.refresh = this.distance > this._options.threshold;
          this._state.pull = this.distance > 0;

          this.pubSub.publish('moved', this);

          return true;
        } else {

          this.scroll();

          return false;
        }
      }
    }, {
      key: 'end',
      value: function end() {

        if (this.didMove) {

          this.pubSub.publish('end', this);

          this.reset();

          return true;
        }
      }
    }, {
      key: 'el',
      get: function get() {
        return this._el;
      }
    }, {
      key: 'state',
      get: function get() {
        return this._state;
      }
    }]);

    return PullRefresh;
  }(Pan);

  window.PullRefresh = PullRefresh;
})(window);
'use strict';

(function () {

  'use strict';

  /* istanbul ignore next */

  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  angular.module('pullrefresh').run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/pullrefresh/pullrefresh.html', '<div ng-if="!hideLoader" ng-style="ptrStyle" class="ptr">' + '<span class="genericon genericon-next"></span>' + '<div class="loading">' + '<span class="l1"></span>' + '<span class="l2"></span>' + '<span class="l3"></span>' + '</div>' + '</div>' + '<div ng-style="contentStyle" class="ptr-content">' +
    //'Pull down to refresh!' +
    '<div ng-transclude></div>' + '</div>');
  }]);
})();
//# sourceMappingURL=pullrefresh.js.map
