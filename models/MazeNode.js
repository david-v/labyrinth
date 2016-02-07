function MazeNode (x, z) {
    this.x = x;
    this.z = z;
    this.moves = {};
    this.states = {};
    this.visitOrder = 0;
}

MazeNode.prototype = {
    constructor: MazeNode,

    getId: function () {
        return (this.x + '-' + this.z);
    },

    visit: function() {
        this.states.visited = true;
    },

    isVisited: function() {
        return (this.states.visited == true);
    },

    setMove: function(direction, destiny) {
        this.moves[direction] = destiny;
    }
};

module.exports = MazeNode;
