var http = require('http');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var Maze = require('./models/Maze.js');
var path = require('path');

MongoClient.connect('mongodb://localhost:27017/daworldo', function(err, db) {
    if(err) throw err;

    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/mazes', function(req, res, next) {
        var maze = new Maze(25,15);
        maze.generate();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(maze.toJson());
    });

    app.get('/api/games', function(req, res, next) {
        var playerName = 'player-' + (Math.floor(Math.random() * 6) + 1);
        var games = db.collection('games');
        games.findOne({'nPlayers': {'$lt': 2}}, function(err, doc) {
            if(err) throw err;
            if (doc == null) {
                console.log('No games found');
                games.insertOne(
                    {
                        'nPlayers': 1,
                        'players': [{'name': playerName}],
                        'created': Date.now()
                    },
                    function(err) {
                        if (err) throw err;
                    }
                );
            } else {
                console.log('Game found');
                games.updateOne(
                    {'_id': doc['_id']},
                    {
                        '$inc': {'nPlayers': 1},
                        '$push': {'players': {'name': playerName}}
                    },
                    function(err) {
                        if (err) throw err;
                    }
                );
            }
        });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send();
    });

    var server = http.createServer(app);
    server.listen(3001);
});