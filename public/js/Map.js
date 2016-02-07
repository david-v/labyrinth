var Utils = new Utils();

function Map () {
    this.dom = $('#maze-container');
    this.mX = null;
    this.mZ = null;
    this.nodes = null;
    this.playerId = null;
    this.players = null;
    this.directions = ['N', 'E', 'S', 'W'];
    this.inverseDir = {'N': 'S', 'E': 'W', 'S': 'N', 'W': 'E'};
    this.load();
}

Map.prototype = {

    constructor: Map,

    load: function() {
        var xmlhttp = new XMLHttpRequest();
        var map = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var rawMaze = JSON.parse(xmlhttp.responseText);
                map.nodes = rawMaze.nodes;
                map.mX = rawMaze.mX;
                map.mZ = rawMaze.mZ;
                map.render();
            }
        };
        xmlhttp.open("GET", "/api/mazes", true);
        xmlhttp.send();
    },

    render: function() {
        var view = '<table>';
        for (var z = 0; z < this.mZ; z++) {
            view += '<tr>';
            for (var x = 0; x < this.mX; x++) {
                var nodeId = x + '-' + z;
                var nodeClass = '';
                var node = this.nodes[nodeId];
                for (var move in node.moves) {
                    if (!node.moves.hasOwnProperty(move)) {
                        continue;
                    }
                    nodeClass += ' ' + move;
                }
                view += '<td id="' + nodeId + '" class="' + nodeClass + '">' + ''/*node.visitOrder*/ + '</td>';
            }
            view += '</tr>';
        }
        view += '</table>';
        this.dom.html(view);
        this.play();
    },

    randomisePlayerPosition: function(playerId) {
        //var player = this.players[i];
        var startNode = Utils.getRandomProperty(this.nodes);
        this.players[playerId].x = startNode.x;
        this.players[playerId].z = startNode.z;
    },

    play: function() {
        var playerId = 'player-' + (Math.floor(Math.random() * 10000) + 1);
        this.playerId = playerId;
        var player = new Player(playerId);
        this.players = {};
        this.players[playerId] = player;
        this.randomisePlayerPosition(playerId);
        this.drawPlayer(playerId);
        this.startControls();
        this.createBots(10);
        //this.findGame();
    },

    findGame: function() {
        var xmlhttp = new XMLHttpRequest();
        var map = this;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                console.log(response);
            }
        };
        xmlhttp.open("GET", "/api/games", true);
        xmlhttp.send();
    },

    drawPlayer: function(playerId) {
        var player = this.players[playerId];
        this.dom.find('td.player-' + playerId)
            .removeClass('player-' + playerId)
            .removeClass('player')
            .html('');
        this.dom.find('#'+player.getPosition())
            .addClass('player-' + playerId)
            .addClass('player')
            .html('<span style="color: ' + player.color + '">o</span>');
    },

    startControls: function() {
        var map = this;
        document.onkeydown = function(e) {
            switch (e.keyCode) {
                case 37:
                    map.handlePlayerMove(map.playerId, 'W');
                    break;
                case 38:
                    map.handlePlayerMove(map.playerId, 'N');
                    break;
                case 39:
                    map.handlePlayerMove(map.playerId, 'E');
                    break;
                case 40:
                    map.handlePlayerMove(map.playerId, 'S');
                    break;
            }
        };
    },

    handlePlayerMove: function(playerId, dir) {
        var originId = this.players[playerId].getPosition();
        var originNode = this.nodes[originId];
        var destinyId = originNode.moves[dir];
        if (typeof(destinyId) == 'undefined') {
            return false;
        }
        var destinyNode = this.nodes[destinyId];
        this.players[playerId].move(destinyNode.x, destinyNode.z);
        this.drawPlayer(playerId);
        return true;
    },

    createBots: function (n) {
        for (var i = 0; i < n; i++) {
            this.createBot('bot-' + i);
        }
    },

    createBot: function(playerId) {
        var bot = new Player(playerId);
        this.players[bot.id] = bot;
        this.randomisePlayerPosition(bot.id);
        this.randomMove(bot.id);
    },

    randomMove: function (playerId, lastDir) {
        var bestMove;
        var player = this.players[playerId];

        var currentNodeId = player.getPosition();
        var currentNode = this.nodes[currentNodeId];

        var currentNodeMoves = Object.keys(currentNode.moves);
        if ('undefined' == typeof(lastDir)) {
            bestMove = currentNodeMoves[Math.floor(Math.random() * currentNodeMoves.length)];
        } else {
            var previousNodeId = currentNode.moves[this.inverseDir[lastDir]];
            var previousNode = this.nodes[previousNodeId];

            var wasGoingForward = (currentNode.visitOrder > previousNode.visitOrder);

            var moveScore = [];
            var lessVisitedDirection;
            var lessVisited = 99999999;
            var mostVisitedDirection;
            var mostVisited = 0;
            for (var dir in currentNode.moves) {
                if (!currentNode.moves.hasOwnProperty(dir)) {
                    continue;
                }
                if (dir == this.inverseDir[lastDir]) {
                    moveScore[dir] = 1;
                    continue;
                }
                var nextNodeId = currentNode.moves[dir];
                var nextNode = this.nodes[nextNodeId];

                var wouldGoForward = (nextNode.visitOrder > currentNode.visitOrder);
                if ((wouldGoForward && wasGoingForward) || (!wouldGoForward && !wasGoingForward)) {
                    moveScore[dir] = 50;
                    continue;
                }
                moveScore[dir] = 20;

                if (('undefined' == typeof(player.visits[nextNodeId])) || (player.visits[nextNodeId] <= lessVisited)) {
                    lessVisited = player.visits[nextNodeId];
                    lessVisitedDirection = dir;
                }
                if (('undefined' == typeof(player.visits[nextNodeId])) || (player.visits[nextNodeId] > mostVisited)) {
                    mostVisited = player.visits[nextNodeId];
                    mostVisitedDirection = dir;
                }
            }

            var visitsDiff = mostVisited - lessVisited;
            moveScore[lessVisitedDirection] += visitsDiff;
            moveScore[lessVisitedDirection] -= visitsDiff;

            var weightedMoveScore = [];
            var i = 0;
            for (var direction in moveScore) {
                if (!moveScore.hasOwnProperty(direction)) {
                    continue;
                }
                for (var j = 0; j < moveScore[direction]; j++) {
                    weightedMoveScore[j] = direction;
                }
                i++;
            }
            bestMove = weightedMoveScore[Math.floor(Math.random() * weightedMoveScore.length) + 1];
        }

        this.handlePlayerMove(playerId, bestMove);

        var map = this;
        setTimeout(function() {
            map.randomMove(playerId, bestMove);
        }, 50);
    }
};
