(function() {
  /**
   * Code heavily inspired by @see https://github.com/apeatling/web-pull-to-refresh
   *
   */

  'use strict';

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  var pullrefresh = angular.module('pullrefresh', ['hmTouchEvents']);

  /* @ngInject */
  pullrefresh.directive('pullrefresh', ['$document', function($document) {
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



    function linkPullrefreshDirective($scope, element, attrs) {

      $scope.contentStyle = {};
      $scope.ptrStyle = {};

      var defaults = {
        contentOffset : null,
        threshold : 70,
        resistance : 2.5
      };

      /**
       * Hold all of the merged parameter and default module options
       * @type {object}
       */
      var options = {
        contentOffset : attrs.pullrefreshContentOffset || defaults.contentOffset,
        threshold: attrs.pullrefreshThreshold || defaults.threshold,
        resistance: attrs.pullrefreshResistance || defaults.resistance
      };

      activate();

      ////////////

      function activate() {

      }

      /**
       * Pan event parameters
       * @type {object}
       */
      var pan = {
        enabled: false,
        distance: 0,
        startingPositionY: 0
      };

      /**
       * Easy shortener for handling adding and removing body classes.
       */
      var bodyEl = $document[0].body,
        bodyClass = bodyEl.classList;



      /**
       * Determine whether pan events should apply based on scroll position on panstart
       *
       * @param {object} e - Event object
       */
      $scope.panStart = function(e) {
        pan.startingPositionY = bodyEl.scrollTop;

        if (pan.startingPositionY === 0) {
          pan.enabled = true;
        }
      };

      /**
       * Handle element on screen movement when the pandown events is firing.
       *
       * @param {object} e - Event object
       */
      $scope.panDown = function(e) {
        if (! pan.enabled) {
          return;
        }

        e.preventDefault();
        pan.distance = e.distance / options.resistance;

        _setContentPan();
        _setBodyClass();
      };

      /**
       * Handle element on screen movement when the pandown events is firing.
       *
       * @param {object} e - Event object
       */
      $scope.panUp = function(e) {
        if (! pan.enabled || pan.distance === 0) {
          return;
        }

        e.preventDefault();

        if (pan.distance < e.distance / options.resistance) {
          pan.distance = 0;
        } else {
          pan.distance = e.distance / options.resistance;
        }

        _setContentPan();
        _setBodyClass();
      };

      /**
       * Determine how to animate and position elements when the panend event fires.
       *
       * @param {object} e - Event object
       */
      $scope.panEnd = function(e) {
        if (! pan.enabled) {
          return;
        }

        e.preventDefault();

        $scope.contentStyle = {};
        $scope.ptrStyle = {};

        if (bodyClass.contains('ptr-refresh')) {
          _doLoading();
        } else {
          _doReset();
        }

        pan.distance = 0;
        pan.enabled = false;
      };

      /**
       * Set the CSS transform on the content element to move it on the screen.
       */
      var _setContentPan = function() {
        // Use transforms to smoothly animate elements on desktop and mobile devices
        $scope.contentStyle = {
          transform: 'translate3d(0, ' + pan.distance + 'px, 0)',
          webkitTransform: 'translate3d(0, ' + pan.distance + 'px, 0)'
        };

        var offset = options.contentOffset !== null ?
           options.contentOffset :
           element[0].querySelector('.ptr').offsetHeight;

        $scope.ptrStyle = {
          transform: 'translate3d(0, ' + (pan.distance - offset) + 'px, 0)',
          webkitTransform: 'translate3d(0, ' + pan.distance + 'px, 0)'
        };
      };

      /**
       * Set/remove the loading body class to show or hide the loading indicator after pull down.
       */
      var _setBodyClass = function() {
        if (pan.distance > options.threshold) {
          bodyClass.add('ptr-refresh');
        } else {
          bodyClass.remove('ptr-refresh');
        }
      };

      /**
       * Position content and refresh elements to show that loading is taking place.
       */
      var _doLoading = function() {
        bodyClass.add('ptr-loading');

        // If no valid loading function exists, just reset elements
        if (!$scope.pullrefresh) {
          return _doReset();
        }

        // The loading function should return a promise
        var loadingPromise = $scope.$eval($scope.pullrefresh);

        // For UX continuity, make sure we show loading for at least one second before resetting
        setTimeout(function() {

          if (loadingPromise.then) {
            // Once actual loading is complete, reset pull to refresh
            loadingPromise.then(_doReset);
          }

        }, 1000);
      };

      /**
       * Reset all elements to their starting positions before any paning took place.
       */
      var _doReset = function() {
        bodyClass.remove('ptr-loading');
        bodyClass.remove('ptr-refresh');
        bodyClass.add('ptr-reset');

        var bodyClassRemove = function() {
          bodyClass.remove('ptr-reset');
          bodyEl.removeEventListener('transitionend', bodyClassRemove, false);
        };

        bodyEl.addEventListener('transitionend', bodyClassRemove, false);
      };

    }
  }]);

})();
