(function() {

  'use strict';

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;


  angular.module('pullrefresh')
    .run(['$templateCache', function($templateCache) {
      $templateCache.put('template/pullrefresh/pullrefresh.html',
        '<div ng-if="!hideLoader" ng-style="ptrStyle" class="ptr">' +
            '<span class="genericon genericon-next"></span>' +

            '<div class="loading">' +
                '<span class="l1"></span>' +
                '<span class="l2"></span>' +
                '<span class="l3"></span>' +
            '</div>' +
        '</div>' +

        '<div ng-style="contentStyle" class="ptr-content">' +
          //'Pull down to refresh!' +
          '<div ng-transclude></div>' +
        '</div>');
    }]);

})();
