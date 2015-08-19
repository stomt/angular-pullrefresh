(function () {

  'use strict';

  function DebugController($scope) {
    var vm = this;

    vm.searchObject = {
      text: "some query",
      to: "userX",
      label: ['foo', 'bar'],
      date: {from: '1/10/2013', to: '15/04/2014'},
      weekdays: [{from: 'Mo', to: 'Tu'}, {from: 'Th', to: 'Sa'}]
    };

    $scope.$watch(function () {
      return vm.searchObject;
    }, function (newValue) {
      console.log(newValue);
    });

    vm.options = {
      keywords: [
        'to',
        'from',
        'label',
        'is',
        'has'
      ],
      ranges: [
        'date',
        'weekdays'
      ]
    };

    vm.submit = function(query) {
      console.log('submit', query);
    };

    vm.loadSuggestions = function(query) {
      var suggestions = [];

      suggestions.push({
        value: 'to:' + (query.text ? query.text : '')
      }, {
        value: 'from:' + (query.text ? query.text : '')
      }, {
        value: 'label:' + (query.text ? query.text : '')
      });

      if (query.text && query.text.length < 5) {
        suggestions.push({
          value: 'has:reaction',
          model: {
            has: ['reaction']
          }
        });
      }

      return suggestions;
    };

    $scope.onReload = function () {
      console.trace("reloading");

      return new Promise(function (ok) {
        window.setTimeout(ok, 3000);
      });
    };

  }


  angular
    .module('Debug')
    .controller('DebugController', DebugController);

})();
