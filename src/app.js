'use strict';

angular.module('chaos', ['chaos.menu', 'chaos.rink', 'ui.router']).
config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('menu', {
            url: "/menu",
            templateUrl: "views/menu/menu.html",
        })
        .state('rink', {
            url: "/rink",
            templateUrl: "views/rink/rink.html"

        })

    $urlRouterProvider.otherwise('/menu');
});
