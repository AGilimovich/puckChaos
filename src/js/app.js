'use strict';

angular.module('chaos', ['chaos.controllers', 'chaos.services', 'chaos.constants', 'ui.router']).
config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('menu', {
            url: "/menu",
            templateUrl: "views/menu.html",
        })
        .state('rink', {
            url: "/rink",
            templateUrl: "views/rink.html"

        })

    $urlRouterProvider.otherwise('/menu');
});
