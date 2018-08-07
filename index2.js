var GameLoopDispatch = require('game-loop-dispatch');
var Objet = require('./classes/Objet');
var Monde = require('./classes/Monde');


/**
 * La partie serveur de jeu
 * @type {GameLoopDispatch}
 */
var iteration = 0;

var gameLoop = new GameLoopDispatch({
    // only require value is the interval in milliseconds
    'interval':100
});

var monde = new Monde(600, 20, 1000, 1000);
monde.generate();
var t = process.hrtime();
gameLoop.tick = function(){
    t = process.hrtime();
    //On pause la game loop
    gameLoop.pause();
    iteration++;
    monde.be();
};

monde.on('done', function(){
    loopTime = process.hrtime(t);
    console.log('benchmark (' + iteration + ') (objets:' + monde.objets.length + ') : %d seconds and %d milliseconds', loopTime[0], loopTime[1]/1000000);
    gameLoop.start();
});

gameLoop.start();


/**
 * LA partie communication WEB
 */

console.log("_____________________");
console.log("Lancement du vivarium");
console.log("http sur port 8080");
console.log("ctrl+C pour arreter");
var fs = require('fs');
// LE SERVEUR HTTP
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/http'));

var server = app.listen(8080);
// Chargement de socket.io
var io = require('socket.io').listen(server, { log: false });//

// Quand on client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {
    console.log('Un client est connecté à socket.io');
    socket.emit('message', 'Un client est connecté à socket.io');

    socket.on('getObjets', function(){
        var data = monde.getObjetsData();
//        console.log(data.length);
        socket.emit('pushObjets', data);
    });

    // connexion coupee
    socket.on('disconnect', function(){
        console.log('Un client s\'est déconnecté.');
        // sauvegarde
    })
});

