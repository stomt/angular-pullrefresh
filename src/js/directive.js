(function() {

  'use strict';

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  var pullrefresh = angular.module('pullrefresh', [/*'pullrefresh.suggest'*/]);

  //
  pullrefresh.directive('pullrefresh', pullrefreshDirective);


  function pullrefreshDirective($document) {
    return {

      transclude : true,

      restrict: 'EA',
      // require: 'ngModel',
      // scope: {
      //   threshold: '=prThreshold',
      //   resistance: '=prResistance',
      //   onReload: '=prOnreload'
      // },
      scope : true,

      // require : 'hm',
      templateUrl: 'template/pullrefresh/pullrefresh.html',
      link: linkPullrefreshDirective
    };



    function linkPullrefreshDirective($scope, elment, attrs, ngModelCtrl) {

      $scope.contentStyle = {};
      $scope.ptrStyle = {};

      var defaults = {
        threshold : 70,
        resistance : 2.5,
        onReload : null,
      };

      /**
       * Hold all of the merged parameter and default module options
       * @type {object}
       */
      var options = {
        threshold: attrs.threshold || defaults.threshold,
        // onReload: attrs.onReload || defaults.onReload,
        onReload: attrs.pullrefresh || defaults.onReload,
        resistance: attrs.resistance || defaults.resistance
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
      var $body = $document[0].body,
        bodyClass = $body.classList;



      /**
       * Determine whether pan events should apply based on scroll position on panstart
       *
       * @param {object} e - Event object
       */
      $scope.panStart = function(e) {
        pan.startingPositionY = $body.scrollTop;

        if ( pan.startingPositionY === 0 ) {
          pan.enabled = true;
        }
      };

      /**
       * Handle element on screen movement when the pandown events is firing.
       *
       * @param {object} e - Event object
       */
      $scope.panDown = function(e) {
        if ( ! pan.enabled ) {
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
        if ( ! pan.enabled || pan.distance === 0 ) {
          return;
        }

        e.preventDefault();

        if ( pan.distance < e.distance / options.resistance ) {
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
        if ( ! pan.enabled ) {
          return;
        }

        e.preventDefault();

        $scope.contentStyle = {};
        $scope.ptrStyle = {};

        if ( bodyClass.contains( 'ptr-refresh' ) ) {
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
          transform: 'translate3d( 0, ' + pan.distance + 'px, 0 )',
          webkitTransform: 'translate3d( 0, ' + pan.distance + 'px, 0 )'
        };

        $scope.ptrStyle = {
          transform: 'translate3d( 0, ' + ( pan.distance - /*options.ptrEl.offsetHeight*/ 50 ) + 'px, 0 )',
          webkitTransform: 'translate3d( 0, ' + pan.distance + 'px, 0 )'
        };
      };

      /**
       * Set/remove the loading body class to show or hide the loading indicator after pull down.
       */
      var _setBodyClass = function() {
        if ( pan.distance > options.threshold ) {
          bodyClass.add( 'ptr-refresh' );
        } else {
          bodyClass.remove( 'ptr-refresh' );
        }
      };

      /**
       * Position content and refresh elements to show that loading is taking place.
       */
      var _doLoading = function() {
        bodyClass.add( 'ptr-loading' );

        console.log(options.onReload);

        // If no valid loading function exists, just reset elements
        if ( ! options.onReload ) {
          return _doReset();
        }

        // The loading function should return a promise
        var loadingPromise = $scope.$eval(options.onReload);

        // For UX continuity, make sure we show loading for at least one second before resetting
        setTimeout( function() {
          // Once actual loading is complete, reset pull to refresh
          loadingPromise.then( _doReset );
        }, 1000 );
      };

      /**
       * Reset all elements to their starting positions before any paning took place.
       */
      var _doReset = function() {
        bodyClass.remove( 'ptr-loading' );
        bodyClass.remove( 'ptr-refresh' );
        bodyClass.add( 'ptr-reset' );

        var bodyClassRemove = function() {
          bodyClass.remove( 'ptr-reset' );
          $body.removeEventListener( 'transitionend', bodyClassRemove, false );
        };

        $body.addEventListener( 'transitionend', bodyClassRemove, false );
      };

    }
  }

})();
