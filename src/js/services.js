angular.module('chaos.services', []).
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

