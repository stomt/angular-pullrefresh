(function () {

  'use strict';

  function DebugController($scope) {
    var vm = this;


    $scope.onReload = function () {
      console.log("reloading");

      return new Promise(function (ok) {
        window.setTimeout(ok, 3000);
      });
    };

  }


  angular
    .module('Debug')
    .controller('DebugController', DebugController);

})();
