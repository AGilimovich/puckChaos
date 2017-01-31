/**
 * Created by Aleksandr on 31.01.2017.
 */

angular.module('chaos.rink', [])
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

    .
    factory('RinkService', function () {
        var min_X, max_X, min_Y, max_Y;
        const r = 20;
        var num = 2;
        var speed = 5;
        var dist = 2 * Math.pow(1.2, 5-1);

        return {

            setRoomSize: function (x, X, y, Y) {
                min_X = x + r;
                max_X = X - r;
                min_Y = y + r;
                max_Y = Y - r;
            },
            getRandomCoords: function () {
                var random = Math.random();
                return random < 0.5 ? {

                    'x': min_X,
                    'y': Math.random() * (max_Y - min_Y) + min_Y,
                } : {

                    'x': max_X,
                    'y': Math.random() * (max_Y - min_Y) + min_Y,
                };
            },
            checkCursorInCenter: function (coords) {
                var center = this.getCenter();
                return ((center.x - r) < coords.x) &&
                    (coords.x < (center.x + r)) &&
                    (( center.y - r) < coords.y) &&
                    (coords.y < (center.y + r ));
            },

            getRandomVector: function () {
                return Math.random() * 360;
            },

            getCenter: function () {
                return {'x': (max_X - min_X) / 2, 'y': (max_Y - min_Y) / 2}
            },
            getRadius: function () {
                return r;
            },
            getNextCoords: function (puck) {
                var newX, newY, newVector;
                var done = false;
                while (!done) {
                    newX = puck.coord_X + (dist * Math.cos(puck.vector));
                    newY = puck.coord_Y + (dist * Math.sin(puck.vector));
                    if (newX < min_X || newX > max_X || newY < min_Y || newY > max_Y) {
                        newVector = Math.random() * 360;
                        puck.vector = newVector;
                    } else {
                        done = true;
                        break;
                    }
                }
                puck.coord_X = newX;
                puck.coord_Y = newY;
            },
            isOverlapped: function (pucks, playerPuck) {
                for (var i = 0; i < pucks.length; i++) {
                    var deltaX = Math.abs(pucks[i].coord_X - playerPuck.coord_X);
                    var deltaY = Math.abs(pucks[i].coord_Y - playerPuck.coord_Y);
                    if (Math.pow(deltaX, 2) + Math.pow(deltaY, 2) < Math.pow(2 * r, 2)) {
                        return true;
                    }
                }
                return false;
            },
            getNumberOfPucks: function () {
                return num;
            },
            setNumberOfPucks: function (_num) {
                num = _num;
            },
            getSpeed: function () {
                return speed;
            },
            setSpeed: function (val) {
                speed = val;
                dist = 2 * Math.pow(1.2, speed - 1);
            }
        }
    })


    .factory('PucksService', function (RinkService) {
        function Puck(coords, vector) {
            this.coord_X = coords.x;
            this.coord_Y = coords.y;
            this.vector = vector;
        }

        function PlayerPuck(coords) {
            this.coord_X = coords.x;
            this.coord_Y = coords.y;
        }

        var pucks = [];
        var playerPuck;

        return {
            initPucks: function (number) {
                pucks = [];
                playerPuck = new PlayerPuck(RinkService.getCenter());
                for (var i = 0; i < number; i++) {
                    pucks.push(new Puck(RinkService.getRandomCoords(), RinkService.getRandomVector()));
                }
            },
            getPucks: function () {
                return pucks;
            },
            getPlayerPuck: function () {
                return playerPuck;
            },


            updateCoords: function () {
                for (var i = 0; i < pucks.length; i++) {
                    RinkService.getNextCoords(pucks[i]);
                }
            },
            setPlayerPuckCoords: function (x, y) {
                playerPuck.coord_X = x;
                playerPuck.coord_Y = y;
            },
            destroyPucks: function () {
                pucks = [];
            }
        }
    })
    .factory('ScoreService', function () {
        var scoreTable = [];

        return {
            calculateScore: function (name, pucks, time, speed) {
                scoreTable.push({name: name, score: Math.pow(pucks, 2) * Math.pow(speed, 2) * time});
                scoreTable.sort(function (a, b) {
                        return b - a;
                    }
                )
            },
            showRecords: function () {
                return Array.splice(0, 5);
            }
        }

    })

    .constant('GameStatus', {
        PENDING: 0,
        ONGOING: 1,
        ENDED: 2
    })