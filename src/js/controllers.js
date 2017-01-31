angular.module('chaos.controllers', [])
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
    .controller('RinkController', function ($scope, PucksService, RinkService, ScoreService, $interval, GameStatus, $state) {
        var c = document.getElementById("myCanvas");
        RinkService.setRoomSize(0, c.width, 0, c.height);
        var ctx = c.getContext("2d");
        var game = new Game(RinkService.getNumberOfPucks());

        $scope.returnToMenu = function () {
            $state.go("menu");
        }

        $scope.restart = function () {
            game.stop();
            game = new Game(RinkService.getNumberOfPucks());
        }


        c.addEventListener('mousemove', function (evt) {
            var mousePos = getMousePos(evt);

            switch (game.getStatus()) {
                case GameStatus.PENDING:
                    if (RinkService.checkCursorInCenter(mousePos)) {
                        game.start();
                        $scope.$broadcast('start');
                    }
                    break;
                case GameStatus.ONGOING:
                    PucksService.setPlayerPuckCoords(mousePos.x, mousePos.y);
                    break;
            }

        }, false);


        function Game(pucksNumber) {
            var ticker;
            var gameStatus = GameStatus.PENDING;
            PucksService.initPucks(pucksNumber);
            printStartGame(ctx);


            var stop = function () {
                gameStatus = GameStatus.ENDED;
                $interval.cancel(ticker);
                $scope.$broadcast('stop');
                printEndGame(ctx);
                PucksService.destroyPucks();
            }


            this.start = function () {
                gameStatus = GameStatus.ONGOING;
                ticker = $interval(function () {
                    if (!RinkService.isOverlapped(PucksService.getPucks(), PucksService.getPlayerPuck())) {
                        print(PucksService.getPucks(), PucksService.getPlayerPuck());
                        $scope.coords = PucksService.updateCoords();
                    } else {
                        stop();
                    }
                }, 10);
            };

            this.stop = function () {
                stop();
            }

            this.getStatus = function () {
                return gameStatus;
            }


        }


        function getMousePos(evt) {
            var rect = c.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }


        function print(pucks, playerPuck) {
            ctx.clearRect(0, 0, c.width, c.height);

            ctx.beginPath();
            ctx.strokeStyle = '#ff0000';
            ctx.arc(playerPuck.coord_X, playerPuck.coord_Y, RinkService.getRadius(), 0, 2 * Math.PI);
            ctx.stroke();

            for (var i = 0; i < pucks.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
                ctx.arc(pucks[i].coord_X, pucks[i].coord_Y, RinkService.getRadius(), 0, 2 * Math.PI);
                ctx.stroke();
            }

        }

        function printEndGame() {
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.font = "50px Verdana";
            var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
            gradient.addColorStop("0.5", "blue");
            gradient.addColorStop("1.0", "red");
            ctx.fillStyle = gradient;
            ctx.fillText("GAME OVER!", 80, 200);
        }

        function printStartGame() {
            ctx.clearRect(0, 0, c.width, c.height);
            ctx.beginPath();
            ctx.strokeStyle = '#000000';
            ctx.arc(RinkService.getCenter().x, RinkService.getCenter().y, RinkService.getRadius(), 0, 2 * Math.PI);
            ctx.stroke();
            ctx.font = "15px Verdana";
            var gradient = ctx.createLinearGradient(0, 0, c.width, 0);
            gradient.addColorStop("0.5", "blue");
            gradient.addColorStop("1.0", "red");
            ctx.fillStyle = gradient;
            ctx.fillText("To start the game move cursor inside the circle!", 60, 250);
        }


    })
    .
    controller('TimeController', function ($scope, $interval) {
        $scope.time = 0;
        var timer;

        $scope.$on('start', function (event, data) {
            $scope.time = 0;
            startTimer();
        })

        $scope.$on('stop', function (event, data) {
            stopTimer();
        })

        function startTimer() {
            timer = $interval(function () {
                $scope.time += 10;
            }, 10)
        }

        function stopTimer() {
            $interval.cancel(timer);
        }


    })