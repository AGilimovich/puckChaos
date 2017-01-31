angular.module('chaos.menu',[])
    .controller('MenuController', function ($scope, RinkService, $state) {

        $scope.number = RinkService.getNumberOfPucks();
        $scope.setNumber = function (num) {
            RinkService.setNumberOfPucks(num)
        }

        $scope.speed = RinkService.getSpeed();

        $scope.changeSpeed = function (newVal) {
            RinkService.setSpeed(newVal);
        }


        $scope.start = function () {
            $state.go("rink");

        }


    })
