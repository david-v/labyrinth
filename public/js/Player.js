function Player (id) {
    this.id = (('undefined' != typeof(id)) ? id : (Math.floor(Math.random() * 10000) + 1));
    this.x = null;
    this.z = null;
    this.hp = 10;
    var colors = ['red', 'blue', 'yellow', 'black', 'orange', 'purple'];
    this.color = colors[Math.floor(Math.random() * colors.length) + 1];
    this.moves = 0;
    this.stupidity = 0;
    this.visits = {};
}

Player.prototype = {
    constructor: Player,
    getPosition: function() {
        return this.x + '-' + this.z;
    },
    move: function(x, z) {
        this.moves++;
        if('undefined' == typeof(this.visits[x + '-' + z])) {
            this.visits[x + '-' + z] = 0;
        }
        this.visits[x + '-' + z]++;
        this.x = x;
        this.z = z;
    }
};
