function Utils () {}

Utils.prototype = {
    constructor: Utils,
    getRandomProperty: function (obj) {
        var keys = Object.keys(obj);
        return obj[keys[ keys.length * Math.random() << 0]];
    },
    shuffleArray: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex ;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
};

if (typeof(module) != 'undefined') {
    module.exports = Utils;
}
