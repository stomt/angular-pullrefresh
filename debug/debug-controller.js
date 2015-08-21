(function () {

  'use strict';

  function DebugController($scope) {
    var vm = this;


    $scope.onReload = function () {
      console.trace("reloading");

      return new Promise(function (ok) {
        window.setTimeout(ok, 30000);
      });
    };

  }


  angular
    .module('Debug')
    .controller('DebugController', DebugController);

})();
