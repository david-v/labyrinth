var MazeNode = require("./MazeNode");
var Utils = require("../public/js/Utils");

/**
 * Maze constructor
 *
 * @param mX integer: total cells horizontally (0 = West, mX = East)
 * @param mZ integer: total cells vertically (0 = South, mZ = North)
 *
 * @constructor
 */
function Maze (mX, mZ) {
    this.mX = mX;
    this.mZ = mZ;
    this.nUnvisited = mX * mZ;
    this.nVisited = 0;
    this.nodes = {};
    this.moves = {
        N: {x:  0, z: -1, opposite: 'S'},
        E: {x:  1, z:  0, opposite: 'W'},
        S: {x:  0, z:  1, opposite: 'N'},
        W: {x: -1, z:  0, opposite: 'E'}
    };
    this.init();
}

Maze.prototype = {
    constructor: Maze,

    /**
     * Initialise maze nodes
     */
    init: function() {
        for (var x = 0; x < this.mX; x++) {
            for (var z = 0; z < this.mZ; z++) {
                this.setNode(new MazeNode(x, z));
            }
        }
    },

    generate: function() {
        var randomNode = Utils.prototype.getRandomProperty(this.nodes);
        randomNode.visit();
        this.nUnvisited--;
        this.nVisited++;
        randomNode.visitOrder = this.nVisited;
        this.recursiveCarving(randomNode.getId());
    },

    recursiveCarving: function(nodeId) {
        //console.log(this.nUnvisited + ' -> ' + nodeId);
        var directions = ['N', 'E', 'S', 'W'];
        Utils.prototype.shuffleArray(directions);
        for (var i = 0; i < directions.length; i++) {
            var adjNode = this.carvePath(nodeId, directions[i]);
            if (false !== adjNode) {
                this.recursiveCarving(adjNode);
            }
        }
        //console.log('Visited all 4 directions on: ' + nodeId);
    },

    /**
     * Opens from "nodeId" a -cell-long path in the specified direction
     *
     * @param nodeId string
     * @param dir string: ('N', 'S', 'E', 'W')
     * @param nCells the number of cells to
     * @returns boolean
     */
    carvePath: function(nodeId, dir, nCells) {
        nCells = (typeof(nCells) == 'undefined') ? 1 : nCells;
        var node1 = this.getNode(nodeId);
        if ((null == node1) || (node1.isVisited() == false)) {
            return false;
        }
        if (typeof(this.moves[dir]) == 'undefined') {
            return false;
        }
        var x2 = node1.x + this.moves[dir].x;
        var z2 = node1.z + this.moves[dir].z;
        var dir2 = this.moves[dir].opposite;

        if ((x2 < 0) || (x2 >= this.mX) || (z2 < 0) || (z2 >= this.mZ)) {
            return false;
        }

        var node2 = this.getNode(x2 + '-' + z2);
        if (node2.isVisited()) {
            return false;
        }
        node1.setMove(dir, node2.getId());
        node2.setMove(dir2, node1.getId());
        node2.visit();
        this.nUnvisited--;
        this.nVisited++;
        node2.visitOrder = this.nVisited;
        if (nCells == 1) {
            return node2.getId();
        }
        return this.carvePath(node2.getId(), dir, nCells - 1);
    },

    getNode: function(nodeId) {
        var node = this.nodes[nodeId];
        return typeof(node) == 'undefined' ? null : node;
    },

    setNode: function(node) {
        this.nodes[node.getId()] = node;
    },

    toJson: function() {
        return JSON.stringify(this);
    }
};

module.exports = Maze;
